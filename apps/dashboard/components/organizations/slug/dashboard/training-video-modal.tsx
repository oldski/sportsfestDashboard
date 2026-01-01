'use client';

import * as React from 'react';
import { XIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@workspace/ui/components/drawer';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';

export interface TrainingVideo {
  id: number;
  title: string;
  duration: string;
  youtubeId: string;
}

interface TrainingVideoModalProps {
  video: TrainingVideo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TrainingVideoModal({ video, isOpen, onClose }: TrainingVideoModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (!video) return null;

  // Use youtube-nocookie.com for privacy-enhanced mode (often fixes embed issues)
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtubeId}`;

  const content = (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={isOpen ? embedUrl : ''}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="pr-8">{video.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">Duration: {video.duration}</p>
          </DialogHeader>
          <div className="px-4 pb-4">
            {content}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{video.title}</DrawerTitle>
          <p className="text-sm text-muted-foreground">Duration: {video.duration}</p>
        </DrawerHeader>
        <div className="px-4 pb-4">
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
