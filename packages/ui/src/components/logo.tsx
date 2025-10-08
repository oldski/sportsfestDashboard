'use client';

import * as React from 'react';

import { APP_NAME } from '@workspace/common/app';
import { cn } from '@workspace/ui/lib/utils';
import Image from "next/image";

export type LogoElement = React.ComponentRef<'div'>;
export type LogoProps = React.ComponentPropsWithoutRef<'div'> & {
  hideSymbol?: boolean;
  hideWordmark?: boolean;
  isBanner?: boolean;
  isFull?: boolean;
  width?: number;
  height?: number;
  variant?: 'light' | 'dark';
};
export function Logo({
  isBanner = false,
  isFull,
  width = 200,
  height = 111,
  variant,
  className,
  ...other
}: LogoProps): React.JSX.Element {

  isFull = isFull === true || isBanner !== true;
  width = !isFull ? 200 : width;
  height = !isFull ? 65 : height;

  return (
    <div
      className={cn('flex items-center space-x-2', className)}
      {...other}
    >
      {(isFull && variant !== 'light') && (
        <Image src="/assets/logo-sportsfest-full.png" alt="Corporate SportsFest" width={width} height={height} />
      )}
      {(isBanner && variant !== 'light') && (
        <Image src="/assets/logo-sportsfest-banner.png" alt="Corporate SportsFest" width={width} height={height} />
      )}
      {isFull && variant === 'light' && (
        <Image src="/assets/logo-sportsfest-full-white.webp" alt="Corporate SportsFest" width={width} height={height} />
      )}

    </div>
  );
}
