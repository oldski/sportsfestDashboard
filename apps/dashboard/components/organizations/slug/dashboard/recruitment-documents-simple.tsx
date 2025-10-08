'use client';

import * as React from 'react';
import {FileTextIcon, MegaphoneIcon, PlayIcon, VideoIcon} from 'lucide-react';
import Link from 'next/link';

import { AspectRatio } from '@workspace/ui/components/aspect-ratio';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@workspace/ui/components/hover-card';

import type { WordPressDocument } from '~/data/wordpress/get-recruitment-documents';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@workspace/ui/components/card";
import { PlayerSignUpButton } from './player-signup-button';

interface RecruitmentDocumentsSimpleProps {
  documents: WordPressDocument[];
  organizationSlug: string;
  error?: string;
}

export function RecruitmentDocumentsSimple({ documents, organizationSlug, error }: RecruitmentDocumentsSimpleProps) {
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
              {documents.length} document{documents.length !== 1 ? 's' : ''} and training materials available
            </CardDescription>
          </div>
          <PlayerSignUpButton organizationSlug={organizationSlug} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Documents Section - Takes up 2/3 of the space */}
            <div className="lg:col-span-2 space-y-4">
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

            {/* Training Videos Section - Takes up 1/3 of the space */}
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <VideoIcon className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">Training Videos</h4>
                </div>

                <div className="space-y-3">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="cursor-pointer rounded-md border border-muted bg-muted/30 hover:bg-muted/50 transition-colors">
                        <AspectRatio ratio={16 / 9}>
                          <div className="flex flex-col items-center justify-center h-full p-2">
                            <PlayIcon className="h-6 w-6 text-muted-foreground mb-1" />
                            <p className="text-xs text-center text-muted-foreground">Recruitment Best Practices</p>
                          </div>
                        </AspectRatio>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p className="text-sm font-medium">Recruitment Best Practices</p>
                      <p className="text-xs text-muted-foreground mt-1">Learn effective strategies for team recruitment and player engagement.</p>
                    </HoverCardContent>
                  </HoverCard>

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="cursor-pointer rounded-md border border-muted bg-muted/30 hover:bg-muted/50 transition-colors">
                        <AspectRatio ratio={16 / 9}>
                          <div className="flex flex-col items-center justify-center h-full p-2">
                            <PlayIcon className="h-6 w-6 text-muted-foreground mb-1" />
                            <p className="text-xs text-center text-muted-foreground">Team Management</p>
                          </div>
                        </AspectRatio>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p className="text-sm font-medium">Team Management</p>
                      <p className="text-xs text-muted-foreground mt-1">Essential tips for managing teams and coordinating with players.</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
