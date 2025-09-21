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
    src: '/assets/team-member-signup/sportsfest-beach-volleyball.jpg',
    alt: 'Beach volleyball game in action',
    title: 'Beach Volleyball'
  },
  {
    src: '/assets/team-member-signup/sportsfest-corntoss.jpg',
    alt: 'Team sports competition outdoors',
    title: 'Team Sports'
  },
  {
    src: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1920&h=1080&fit=crop&crop=center',
    alt: 'Corporate team building activities',
    title: 'Team Building'
  },
  {
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&crop=center',
    alt: 'Outdoor sporting event with teams',
    title: 'Sports Festival'
  },
  {
    src: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=1920&h=1080&fit=crop&crop=center',
    alt: 'Beach games and activities',
    title: 'Beach Games'
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
                  className="absolute inset-0 h-full w-full object-cover"
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
