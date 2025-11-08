'use client';

import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from '@workspace/ui/components/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Background slideshow images
const SLIDESHOW_IMAGES = [
  {
    src: '/assets/team-member-signup/sportsfest-beach-volleyball.webp',
    alt: 'Corporate SportsFest Beach volleyball game in action',
    title: 'Beach Volleyball'
  },
  {
    src: '/assets/team-member-signup/sportsfest-corntoss.webp',
    alt: 'Corporate SportsFest Corntoss',
    title: 'Corntoss'
  },
  {
    src: '/assets/team-member-signup/sportsfest-tug-of-war.webp',
    alt: 'Corporate SportsFest Tug-of-War',
    title: 'Tug-of-War'
  },
  {
    src: '/assets/team-member-signup/sportsfest-team-building.webp',
    alt: 'Corporate SportFest Team Building Activities',
    title: 'Team Building'
  },
  {
    src: '/assets/team-member-signup/sportsfest-beach-dodgeball.webp',
    alt: 'Corporate SportsFest Beach Dodgeball',
    title: 'Beach Dodgeball'
  },
  {
    src: '/assets/team-member-signup/sportsfest-bote-beach-challenge.webp',
    alt: 'Corporate SportsFest Surf & Turf Rally',
    title: 'Surf & Turf Rally'
  },
  {
    src: '/assets/team-member-signup/sportsfest-team-spirit.webp',
    alt: 'Corporate SportsFest Team Spirit',
    title: 'Team Spirit'
  }
];

export function BackgroundSlideshow() {
  const autoplayRef = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  return (
    <div className="fixed inset-0 z-0">
      <Carousel
        plugins={[autoplayRef.current]}
        className="w-full h-screen"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="h-screen -ml-0">
          {SLIDESHOW_IMAGES.map((image, index) => (
            <CarouselItem key={index} className="h-screen pl-0">
              <div className="relative h-screen w-full">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="absolute inset-0 h-full w-full object-cover object-top md:object-center"
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {/* Modern SaaS-style elliptical gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          "bg-[radial-gradient(ellipse_100%_75%_at_top,transparent_10%,rgba(255,255,255,0.1)_30%,rgba(255,255,255,0.6)_70%,rgba(255,255,255,0.95)_100%)]"
        )}
      />
    </div>
  );
}
