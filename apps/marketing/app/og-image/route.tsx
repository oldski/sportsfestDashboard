import { ImageResponse } from 'next/og';

import { OgImage } from '@workspace/ui/components/og-image';

export const runtime = 'edge';

export async function GET() {
  const logoUrl = 'http://localhost:3001/assets/logo-sportsfest-full-white.png';
  const backgroundUrl = 'http://localhost:3001/assets/og-image-background.jpg';

  return new ImageResponse(<OgImage logoSrc={logoUrl} backgroundSrc={backgroundUrl} />, {
    width: 1200,
    height: 630
  });
}
