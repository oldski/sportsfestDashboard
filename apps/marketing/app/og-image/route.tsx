import { ImageResponse } from 'next/og';

import { OgImage } from '@workspace/ui/components/og-image';

export const runtime = 'edge';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function GET() {
  // Fetch the logo image and convert to base64
  const logoUrl = 'https://join.sportsfest.com/assets/logo-sportsfest-full-white.webp';

  let logoBase64 = '';
  try {
    const logoResponse = await fetch(logoUrl);
    const logoBuffer = await logoResponse.arrayBuffer();
    logoBase64 = `data:image/webp;base64,${arrayBufferToBase64(logoBuffer)}`;
  } catch (error) {
    console.error('Failed to fetch logo:', error);
  }

  return new ImageResponse(<OgImage logoSrc={logoBase64} />, {
    width: 1200,
    height: 630
  });
}
