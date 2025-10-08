import * as React from 'react';

import { APP_NAME } from '@workspace/common/app';

export type OgImageProps = {
  logoSrc?: string;
  backgroundSrc?: string;
};

export function OgImage({ logoSrc, backgroundSrc }: OgImageProps): React.JSX.Element {
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
      {backgroundSrc && (
        <img
          src={backgroundSrc}
          alt=""
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          right: '24px',
          bottom: '24px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px'
        }}
      />

      {/* Logo in top left */}
      <img
        src={logoSrc || ''}
        alt="Corporate SportsFest"
        width="500"
        height="277"
        style={{
          position: 'absolute',
          top: '48px',
          left: '48px',
          zIndex: '10'
        }}
      />

      {/* Text content on the right side */}
      {/*<div*/}
      {/*  style={{*/}
      {/*    position: 'absolute',*/}
      {/*    top: '0',*/}
      {/*    right: '0',*/}
      {/*    width: '60%',*/}
      {/*    height: '100%',*/}
      {/*    display: 'flex',*/}
      {/*    flexDirection: 'column',*/}
      {/*    justifyContent: 'flex-start',*/}
      {/*    alignItems: 'flex-start',*/}
      {/*    paddingTop: '58px',*/}
      {/*    zIndex: '10'*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <div*/}
      {/*    style={{*/}
      {/*      fontSize: '56px',*/}
      {/*      fontWeight: '900',*/}
      {/*      lineHeight: '1.2',*/}
      {/*      color: '#f8f8f8',*/}
      {/*      marginBottom: '18px'*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    {APP_NAME}*/}
      {/*  </div>*/}

      {/*  <div*/}
      {/*    style={{*/}
      {/*      fontSize: '28px',*/}
      {/*      fontWeight: '400',*/}
      {/*      lineHeight: '1.6',*/}
      {/*      color: 'rgba(255, 255, 255, 0.95)',*/}
      {/*      marginBottom: '12px'*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    Tampa Bay's Team Building Blast on the Beach*/}
      {/*  </div>*/}

      {/*  <div*/}
      {/*    style={{*/}
      {/*      fontSize: '20px',*/}
      {/*      fontWeight: '400',*/}
      {/*      lineHeight: '1.6',*/}
      {/*      color: 'rgba(255, 255, 255, 0.95)',*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    No Athletic Skill is Necessary, just Team Spirit and Company Pride!*/}
      {/*  </div>*/}
      {/*</div>*/}

      {[
        { top: '24px', left: '24px' },
        { top: '24px', right: '24px' },
        { bottom: '24px', left: '24px' },
        { bottom: '24px', right: '24px' }
      ].map((position, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#f8f8f8',
            ...position
          }}
        />
      ))}
    </div>
  );
}
