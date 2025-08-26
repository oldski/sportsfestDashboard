import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

type MarqueeProps = React.HtmlHTMLAttributes<HTMLDivElement> & {
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
};

export function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...other
}: MarqueeProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] gap-(--gap)',
        {
          'flex-row': !vertical,
          'flex-col': vertical
        },
        className
      )}
      {...other}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn('flex shrink-0 justify-around gap-(--gap)', {
              'animate-marquee flex-row': !vertical,
              'animate-marquee-vertical flex-col': vertical,
              'group-hover:paused': pauseOnHover,
              '[animation-direction:reverse]': reverse
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
