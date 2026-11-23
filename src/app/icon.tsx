import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/** Favicon: italic serif "f" in paper on ink, with a clay underline — echoes the wordmark. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1A1714',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 3,
        }}
      >
        <div style={{ color: '#FAF8F3', fontSize: 24, fontStyle: 'italic', fontFamily: 'serif', lineHeight: 1, marginTop: -2 }}>
          f
        </div>
        <div style={{ width: 14, height: 2, background: '#0B6B43', marginTop: 1 }} />
      </div>
    ),
    { ...size }
  );
}
