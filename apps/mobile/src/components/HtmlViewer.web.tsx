// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT — HtmlViewer (Web)
// En web usa un iframe para renderizar HTML.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

interface Props {
  html?: string | null;
  uri?: string | null;
  style?: object;
}

const iframeStyle: React.CSSProperties = {
  flex: 1,
  width: '100%',
  height: '100%',
  border: 'none',
  backgroundColor: '#0A080F',
};

export function HtmlViewer({ html, uri }: Props) {
  if (html) {
    return (
      <iframe
        srcDoc={html}
        style={iframeStyle}
        sandbox="allow-same-origin"
        title="reading"
      />
    );
  }
  if (uri) {
    return (
      <iframe
        src={uri}
        style={iframeStyle}
        sandbox="allow-same-origin"
        title="reading"
      />
    );
  }
  return null;
}
