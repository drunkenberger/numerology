// ─────────────────────────────────────────────────────────────────────────────
// UTIL — Download & Share
// Exporta lecturas (HTML, PDF) cross-platform.
// Web: usa Blob download / window.print. Native: expo-file-system + sharing.
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';

const PRINT_CSS = `
<style>
  /* ── Override CSS variables to light theme ─────────────────────────── */
  :root {
    --deep: #ffffff !important;
    --surface: #f7f6f3 !important;
    --surface2: #efede8 !important;
    --union: #8B7330 !important;
    --union-light: #6B5520 !important;
    --union-dim: #C9A84C !important;
    --him: #2E6B9E !important;
    --him-light: #1E5580 !important;
    --him-dim: #90C2E7 !important;
    --her: #9E4A5A !important;
    --her-light: #803040 !important;
    --her-dim: #E8A8B5 !important;
    --text: #1a1a1a !important;
    --text-dim: #666 !important;
    --text-body: #333 !important;
  }

  /* ── Base: white background, remove decorative overlay ─────────────── */
  body { background: #fff !important; color: #1a1a1a !important; }
  body::before { display: none !important; }
  .container { padding: 30px 25px !important; }

  /* ── Typography ─────────────────────────────────────────────────────── */
  h1 { color: #2a1f0a !important; }
  h2 { color: #3a2a0a !important; }
  .subtitle { color: #666 !important; }
  p { color: #333 !important; line-height: 1.7; }

  /* ── Header ─────────────────────────────────────────────────────────── */
  .header { margin-bottom: 40px !important; }
  .union-symbol { animation: none !important; filter: none !important; color: #8B7330 !important; }

  /* ── Section titles ─────────────────────────────────────────────────── */
  .section-title { color: #8B7330 !important; }
  .section-title::after { background: linear-gradient(to right, #C9A84C, transparent) !important; }

  /* ── Insight cards ──────────────────────────────────────────────────── */
  .insight-card { break-inside: avoid; }
  .insight-header {
    background: #f7f6f3 !important;
    border: 1px solid #ddd !important; border-left: none !important;
  }
  .insight-body {
    background: #fafaf8 !important;
    border: 1px solid #ddd !important; border-left: none !important;
    border-top: 1px solid #eee !important;
  }
  .insight-body p { color: #333 !important; }
  .insight-title { color: #444 !important; }
  .insight-icon { color: #888 !important; }
  .tag { background: #f0ede5 !important; color: #666 !important; border-color: #ddd !important; }

  /* ── Number cards ───────────────────────────────────────────────────── */
  .number-card {
    background: #f7f6f3 !important;
    border: 1px solid #ccc !important;
    break-inside: avoid;
  }
  .number-card::before { background: #C9A84C !important; }
  .number-card.master {
    background: linear-gradient(135deg, #f7f6f3, #f0ede5) !important;
    border-color: #C9A84C !important;
  }
  .number-card .card-label { color: #888 !important; }
  .number-card .card-number { color: #3a2a0a !important; }
  .number-card .card-symbol { color: #888 !important; }
  .number-card .card-name { color: #888 !important; }
  .master-badge { background: #f5edd5 !important; color: #8B7330 !important; border-color: #C9A84C !important; }
  .special-badge { background: #e5f0f8 !important; color: #2E6B9E !important; border-color: #90C2E7 !important; }

  /* ── Family constellation ───────────────────────────────────────────── */
  .family-constellation {
    background: #f7f6f3 !important;
    border: 1px solid #ddd !important;
    break-inside: avoid;
  }
  .member-pill {
    background: #fff !important;
    border: 1px solid #ccc !important;
  }
  .member-destiny { color: #3a2a0a !important; }
  .member-name { color: #333 !important; }
  .member-rel { color: #888 !important; }
  .family-number-block {
    background: #f0ede5 !important;
    border: 1px solid #C9A84C !important;
  }
  .fn-label { color: #888 !important; }
  .fn-number { color: #3a2a0a !important; }
  .fn-symbol { color: #888 !important; }
  .fn-name { color: #888 !important; }

  /* ── Family member maps ─────────────────────────────────────────────── */
  .member-map-name { color: #2a1f0a !important; }
  .member-map-rel { color: #888 !important; }

  /* ── Roles section ──────────────────────────────────────────────────── */
  .role-item {
    background: #fafaf8 !important;
    border-left: 3px solid #C9A84C !important;
    break-inside: avoid;
  }
  .role-name { color: #3a2a0a !important; }
  .role-text p { color: #333 !important; }

  /* ── Synthesis ──────────────────────────────────────────────────────── */
  .synthesis {
    background: #f7f6f3 !important;
    border: 1px solid #ddd !important;
    break-inside: avoid;
  }
  .synthesis::before { color: rgba(200,168,76,0.08) !important; }
  .synthesis h2 { color: #3a2a0a !important; }
  .synthesis p { color: #333 !important; }

  /* ── Quote/split boxes ──────────────────────────────────────────────── */
  .quote-box { background: #f7f6f3 !important; color: #333 !important; }
  .split-him, .split-her {
    background: #f7f6f3 !important;
    border-color: #ddd !important;
  }
  .split-text { color: #444 !important; }

  /* ── Score section ──────────────────────────────────────────────────── */
  .score-section { background: #f7f6f3 !important; border-color: #ddd !important; }
  .score-num { color: #3a2a0a !important; }
  .score-bar { background: #e0e0e0 !important; }

  /* ── Compatibility names ────────────────────────────────────────────── */
  .person-card { background: #f7f6f3 !important; border-color: #ddd !important; }
  .person-name { color: #2a1f0a !important; }
  .union-center { background: #f0ede5 !important; border-color: #ddd !important; }

  /* ── Footer ─────────────────────────────────────────────────────────── */
  .footer { color: #999 !important; border-top-color: #ddd !important; }
  .ornament { color: #ccc !important; }

  /* ── Print layout ───────────────────────────────────────────────────── */
  @page { margin: 0.6in; }
</style>
`;

// ── Web helpers ──────────────────────────────────────────────────────────────

function downloadBlobWeb(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printHtmlWeb(html: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  // Use srcdoc approach via blob URL to avoid document.write
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  printWindow.location.href = blobUrl;
  printWindow.addEventListener('load', () => {
    printWindow.focus();
    printWindow.print();
    URL.revokeObjectURL(blobUrl);
  });
}

// ── Native helpers ───────────────────────────────────────────────────────────

async function shareNativeHtml(html: string, filename: string) {
  const FileSystem = require('expo-file-system');
  const Sharing = require('expo-sharing');
  const localUri = `${FileSystem.cacheDirectory}${filename}.html`;
  await FileSystem.writeAsStringAsync(localUri, html, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(localUri, { mimeType: 'text/html' });
}

async function shareNativePdf(html: string, filename: string) {
  const FileSystem = require('expo-file-system');
  const Sharing = require('expo-sharing');
  const { printToFileAsync } = require('expo-print');

  let printHtml = html;
  printHtml = printHtml.replace('</head>', `${PRINT_CSS}\n</head>`);
  printHtml = printHtml.replace(
    '<body>',
    '<body style="background:#fff!important;color:#1a1a1a!important;">',
  );

  const { uri } = await printToFileAsync({
    html: printHtml,
    width: 612,
    height: 792,
  });

  const dest = `${FileSystem.cacheDirectory}${filename}.pdf`;
  await FileSystem.moveAsync({ from: uri, to: dest });
  await Sharing.shareAsync(dest, { mimeType: 'application/pdf' });
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function shareHtml(html: string, filename: string): Promise<void> {
  if (Platform.OS === 'web') {
    downloadBlobWeb(html, `${filename}.html`, 'text/html;charset=utf-8');
    return;
  }
  await shareNativeHtml(html, filename);
}

export async function sharePdf(html: string, filename: string): Promise<void> {
  if (Platform.OS === 'web') {
    let printHtml = html;
    printHtml = printHtml.replace('</head>', `${PRINT_CSS}\n</head>`);
    printHtml = printHtml.replace(
      '<body>',
      '<body style="background:#fff!important;color:#1a1a1a!important;">',
    );
    printHtmlWeb(printHtml);
    return;
  }
  await shareNativePdf(html, filename);
}
