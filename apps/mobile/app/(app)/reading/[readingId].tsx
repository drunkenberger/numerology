// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — Reading
// Muestra la lectura completa en un WebView con el template HTML didáctico.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { HtmlViewer } from '../../../src/components/HtmlViewer';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { render } from '@jyotish/html-templates';
import type { TemplateInput } from '@jyotish/html-templates';
import { CosmicBackground } from '../../../src/components/CosmicBackground';
import { ReadingExportButtons } from '../../../src/components/ReadingExportButtons';
import { COLORS, FONTS, FONT_SIZE, SPACING } from '../../../src/constants/design';
import { api } from '../../../src/services/api';
import type { ReadingContent } from '../../../src/services/api';
import { useStore } from '../../../src/stores/app.store';
import { calculateMap } from '@jyotish/numerology';

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ReadingScreen() {
  const params = useLocalSearchParams<{
    readingId: string;
    type?:     string;
    htmlUrl?:  string;
    memberNames?: string;
  }>();

  const storeReading = useStore(s => s.readings[params.readingId]);
  const storeMembers = useStore(s => s.members);

  const [fetchedContent, setFetchedContent]     = useState<ReadingContent | null>(null);
  const [fetchedType, setFetchedType]           = useState<string | null>(null);
  const [fetchedHtmlUrl, setFetchedHtmlUrl]     = useState<string | null>(null);
  const [fetchedMemberIds, setFetchedMemberIds] = useState<string[]>([]);
  const [loading, setLoading]                   = useState(false);
  const [fetchError, setFetchError]             = useState<string | null>(null);
  const [showExport, setShowExport]             = useState(false);

  // Fetch from API si no está en el store
  useEffect(() => {
    if (storeReading || !params.readingId) return;
    setLoading(true);
    api.getReading(params.readingId)
      .then(data => {
        setFetchedContent(data.full_content);
        setFetchedType(data.type);
        setFetchedHtmlUrl(data.html_export);
        setFetchedMemberIds(data.members ?? []);
      })
      .catch(() => setFetchError('No se pudo cargar la lectura.'))
      .finally(() => setLoading(false));
  }, [params.readingId, !storeReading]);

  const content  = storeReading?.content ?? fetchedContent;
  const type     = ((params.type || storeReading?.type || fetchedType) ?? 'personal') as 'personal' | 'compatibility' | 'family';
  const htmlUrl   = params.htmlUrl || storeReading?.htmlUrl || fetchedHtmlUrl;
  const memberIds = storeReading?.memberIds ?? fetchedMemberIds;

  // Construir members para el template desde el store
  const templateMembers = useMemo(() => {
    return memberIds.map(id => {
      const m = storeMembers.find(sm => sm.id === id);
      if (!m) return null;
      const nums = m.numbers ?? (() => {
        try {
          return calculateMap({
            firstName: m.firstName,
            paternalSurname: m.paternalSurname,
            maternalSurname: m.maternalSurname,
            birthDate: { day: m.birthDay, month: m.birthMonth, year: m.birthYear },
          });
        } catch { return null; }
      })();
      if (!nums) return null;
      return {
        id:              m.id,
        firstName:       m.firstName,
        paternalSurname: m.paternalSurname,
        maternalSurname: m.maternalSurname,
        relation:        m.relation,
        numbers: {
          soul:         nums.soul,
          personality:  nums.personality,
          karma:        nums.karma,
          destiny:      nums.destiny,
          mission:      nums.mission,
          personalYear: nums.personalYear,
        },
      };
    }).filter(Boolean) as TemplateInput['members'];
  }, [memberIds, storeMembers]);

  // Renderizar HTML con el template
  const html = useMemo(() => {
    if (!content || templateMembers.length === 0) return null;
    try {
      const input: TemplateInput = {
        type,
        members:     templateMembers,
        content:     content as any,
        generatedAt: new Date(),
        language:    'es',
      };
      return render(input);
    } catch (err) {
      console.warn('[ReadingScreen] Template render error:', err);
      return null;
    }
  }, [content, type, templateMembers]);

  // Loading / error
  if (loading || (!content && !htmlUrl && !fetchError)) {
    return (
      <CosmicBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.center}>
            {fetchError ? (
              <View style={{ alignItems: 'center', gap: SPACING.md }}>
                <Text style={styles.errorText}>{fetchError}</Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.backLink}>‹ Volver</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ActivityIndicator color={COLORS.gold} size="large" />
            )}
          </View>
        </SafeAreaView>
      </CosmicBackground>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Nav bar */}
        <View style={styles.nav}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
            style={styles.navBtn}
          >
            <Text style={styles.navText}>‹ Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowExport(e => !e)}
            style={styles.navBtn}
          >
            <Text style={styles.navText}>
              {showExport ? 'Cerrar' : 'Exportar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Export panel */}
        {showExport && (
          <View style={styles.exportPanel}>
            <ReadingExportButtons
              html={html}
              filename={`lectura-${params.readingId.slice(0, 8)}`}
            />
          </View>
        )}

        {/* HTML viewer: local template o htmlUrl remoto como fallback */}
        {html ? (
          <HtmlViewer html={html} style={styles.webview} />
        ) : htmlUrl ? (
          <HtmlViewer uri={htmlUrl} style={styles.webview} />
        ) : (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.gold} size="large" />
            <Text style={styles.loadingText}>Preparando lectura...</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A080F' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  // ── Nav
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#0A080F',
  },
  navBtn: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm },
  navText: { fontFamily: FONTS.body, fontSize: FONT_SIZE.sm, color: COLORS.gold, letterSpacing: 0.5 },
  // ── Export
  exportPanel: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  // ── WebView
  webview: { flex: 1, backgroundColor: '#0A080F' },
  // ── Error / Loading
  errorText: { color: COLORS.error, fontFamily: FONTS.body, fontSize: FONT_SIZE.sm },
  backLink: { color: COLORS.gold, fontFamily: FONTS.body },
  loadingText: { color: COLORS.textMuted, fontFamily: FONTS.body, fontSize: FONT_SIZE.sm },
});
