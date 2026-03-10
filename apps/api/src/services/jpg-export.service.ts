// ─────────────────────────────────────────────────────────────────────────────
// SERVICE — JPG Export
// Usa Puppeteer para renderizar HTML a JPEG y sube a Supabase Storage.
// ─────────────────────────────────────────────────────────────────────────────

import puppeteer from 'puppeteer';
import { supabase } from '../utils/supabase';

const BUCKET = 'reading-exports';

export async function generateAndUploadJpg(params: {
  readingId: string;
  userId:    string;
  html:      string;
}): Promise<string | null> {
  const { readingId, userId, html } = params;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 1200, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for fonts to load (runs in browser context via Puppeteer)
    await page.evaluate('document.fonts.ready');

    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 90,
      fullPage: true,
    });

    await browser.close();
    browser = undefined;

    // Upload to Supabase Storage
    const path = `${userId}/${readingId}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, screenshot, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('[jpg-export] Upload error:', uploadError.message);
      return null;
    }

    // Create signed URL (1 year)
    const { data: signedData, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 365);

    if (signError || !signedData) {
      console.error('[jpg-export] Signed URL error:', signError?.message);
      return null;
    }

    // Update reading record
    await supabase
      .from('readings')
      .update({ jpg_export: signedData.signedUrl })
      .eq('id', readingId)
      .eq('user_id', userId);

    return signedData.signedUrl;
  } catch (err) {
    console.error('[jpg-export] Error:', err);
    return null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
