import { ImageResponse } from 'next/og';

import { OgImage } from '@workspace/ui/components/og-image';

export const runtime = 'edge';

export async function GET() {
  const logoUrl = 'https://join.sportsfest.com/assets/logo-sportsfest-full-white.png';
  const backgroundUrl = 'https://join.sportsfest.com/assets/og-image-background.jpg';

  return new ImageResponse(<OgImage logoSrc={logoUrl} backgroundSrc={backgroundUrl} />, {
    width: 1200,
    height: 630
  });
}
