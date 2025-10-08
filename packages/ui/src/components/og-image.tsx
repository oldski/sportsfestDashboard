import * as React from 'react';

import { APP_NAME } from '@workspace/common/app';

export type OgImageProps = {
  logoSrc?: string;
};

export function OgImage({ logoSrc }: OgImageProps): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2942 50%, #0f1f38 100%)',
        color: 'white',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          right: 24,
          bottom: 24,
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 16
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: 48,
          maxWidth: 800,
          zIndex: 10
        }}
      >
        {logoSrc && (
          <img
            src={logoSrc}
            alt="Corporate SportsFest"
            width={400}
            height={222}
            style={{ marginBottom: 24 }}
          />
        )}
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1.2,
            color: '#f8f8f8',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
          }}
        >
          {APP_NAME}
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.75)'
          }}
        >
          Tampa Bay's Team Building Blast on the Beach.
          No Athletic Skill is Necessary, just Team Spirit and Company Pride!
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#f8f8f8',
          top: 24,
          left: 24
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#f8f8f8',
          top: 24,
          right: 24
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#f8f8f8',
          bottom: 24,
          left: 24
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#f8f8f8',
          bottom: 24,
          right: 24
        }}
      />
    </div>
  );
}
