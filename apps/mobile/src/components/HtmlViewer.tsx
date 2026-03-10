// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — HtmlViewer (Native)
// En iOS/Android usa WebView para renderizar HTML.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  html?: string | null;
  uri?: string | null;
  style?: object;
}

export function HtmlViewer({ html, uri, style }: Props) {
  if (html) {
    return (
      <WebView
        source={{ html }}
        style={[styles.webview, style]}
        originWhitelist={['*']}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={false}
      />
    );
  }
  if (uri) {
    return (
      <WebView
        source={{ uri }}
        style={[styles.webview, style]}
        originWhitelist={['*']}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />
    );
  }
  return null;
}

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: '#0A080F' },
});
