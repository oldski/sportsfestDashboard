'use client';

import * as React from 'react';
import {FileTextIcon, MegaphoneIcon, PlayIcon, VideoIcon} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { AspectRatio } from '@workspace/ui/components/aspect-ratio';
// import { HoverCard, HoverCardContent, HoverCardTrigger } from '@workspace/ui/components/hover-card';

import type { WordPressDocument } from '~/data/wordpress/get-recruitment-documents';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@workspace/ui/components/card";
import { PlayerSignUpButton } from './player-signup-button';

interface RecruitmentDocumentsSimpleProps {
  documents: WordPressDocument[];
  organizationSlug: string;
  organizationName: string;
  eventYearName: string;
  eventDate: Date;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
  error?: string;
}

export function RecruitmentDocumentsSimple({
  documents,
  organizationSlug,
  organizationName,
  eventYearName,
  eventDate,
  locationName,
  address,
  city,
  state,
  zipCode,
  latitude,
  longitude,
  error
}: RecruitmentDocumentsSimpleProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return 'Unknown size';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex items-center space-x-2 text-destructive">
          <FileTextIcon className="h-4 w-4" />
          <p className="text-sm font-medium">Error loading documents</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-muted bg-muted/50 p-6 text-center">
        <FileTextIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-muted-foreground">No recruitment documents available</p>
      </div>
    );
  }

  // Training video data
  const trainingVideos = [
    { id: 1, title: 'Accessing Recruitment Tools', duration: '1:15' },
    { id: 2, title: 'Sharing Your Signup Link & QR Code', duration: '1:45' },
    { id: 3, title: 'Customizing Your Organization Logo', duration: '0:52' },
    { id: 4, title: 'The Player Signup Experience', duration: '1:50' },
    { id: 5, title: 'Purchasing Company Teams & Tents', duration: '2:15' },
    { id: 6, title: 'Viewing Your Recruited Players', duration: '1:30' },
    { id: 7, title: 'Building Team Rosters', duration: '2:30' },
    { id: 8, title: 'Building Event Rosters', duration: '2:20' },
    { id: 9, title: 'Best Practices & Tips', duration: '2:10' },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MegaphoneIcon className="h-5 w-5" />
              Recruitment Resources
            </CardTitle>
            <CardDescription>
              {documents.length} document{documents.length !== 1 ? 's' : ''} and {trainingVideos.length} training videos available
            </CardDescription>
          </div>
          <PlayerSignUpButton
            organizationSlug={organizationSlug}
            organizationName={organizationName}
            eventYearName={eventYearName}
            eventDate={eventDate}
            locationName={locationName}
            address={address}
            city={city}
            state={state}
            zipCode={zipCode}
            latitude={latitude}
            longitude={longitude}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Content Grid - Documents on left, Videos on right */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Documents Section - Takes up 1/3 of the space */}
            <div className="lg:col-span-1 space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <FileTextIcon className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Documents</h4>
                </div>

                <div className="space-y-3">
                  {documents.map((document) => (
                    <div key={document.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <FileTextIcon className="h-4 w-4 text-blue-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-foreground hover:text-blue-600 hover:underline transition-colors block truncate"
                        >
                          {document.title}
                        </Link>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span>•</span>
                          <span>{formatDate(document.dateModified)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Click any document to open in a new tab
                  </p>
                </div>
              </div>
            </div>

            {/* Training Videos Section - Takes up 2/3 of the space */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-lg border bg-card p-4">
                {/* ========== COMING SOON VERSION (ACTIVE) ========== */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <VideoIcon className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Training Videos</h4>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    Coming Soon
                  </span>
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                  {trainingVideos.map((video) => (
                    <div key={video.id} className="rounded-md border border-muted overflow-hidden opacity-50 cursor-not-allowed">
                      <AspectRatio ratio={16 / 9}>
                        <div className="relative h-full w-full">
                          <Image
                            src="/assets/graphic-training-video-thumbnail.webp"
                            alt={video.title}
                            fill
                            className="object-cover grayscale"
                            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                          <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                              {video.duration}
                            </div>

                            <PlayIcon className="h-8 w-8 text-white drop-shadow-lg mb-2 opacity-50" />

                            <p className="text-[11px] text-center text-white font-medium leading-tight line-clamp-2 drop-shadow-md">
                              {video.title}
                            </p>
                          </div>
                        </div>
                      </AspectRatio>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Training videos coming soon • {trainingVideos.length} videos in production
                  </p>
                </div>

                {/* ========== CLICKABLE VERSION (ACTIVE WHEN VIDEOS ARE READY) ==========
                <div className="flex items-center space-x-2 mb-4">
                  <VideoIcon className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">Training Videos</h4>
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                  {trainingVideos.map((video) => (
                    <HoverCard key={video.id}>
                      <HoverCardTrigger asChild>
                        <div className="cursor-pointer rounded-md border border-muted overflow-hidden hover:border-green-600 transition-colors group">
                          <AspectRatio ratio={16 / 9}>
                            <div className="relative h-full w-full">
                              <Image
                                src="/assets/graphic-training-video-thumbnail.webp"
                                alt={video.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              />

                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                              <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                                <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                                  {video.duration}
                                </div>

                                <PlayIcon className="h-8 w-8 text-white drop-shadow-lg mb-2 group-hover:text-green-400 transition-colors" />

                                <p className="text-[11px] text-center text-white font-medium leading-tight line-clamp-2 drop-shadow-md">
                                  {video.title}
                                </p>
                              </div>
                            </div>
                          </AspectRatio>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent side="top" className="w-64">
                        <p className="text-sm font-medium">{video.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">Duration: {video.duration}</p>
                        <p className="text-xs text-muted-foreground mt-2">Click to watch this training video</p>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Click any video to watch • {trainingVideos.length} videos available
                  </p>
                </div>
                */}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
