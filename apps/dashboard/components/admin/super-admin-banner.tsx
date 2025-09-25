'use client';

import * as React from 'react';
import Link from 'next/link';
import {EyeIcon, HomeIcon, Undo2Icon} from 'lucide-react';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

export interface SuperAdminBannerProps {
  className?: string;
  organizationName: string;
}

export function SuperAdminBanner({ className, organizationName }: SuperAdminBannerProps): React.JSX.Element {

  return (
    <Alert className={cn('border-amber-600 bg-amber-400 text-amber-900 rounded-none py-1 px-4 text-xs', className)}>
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2" title={`Viewing ${organizationName}`}>
          <EyeIcon className="h-5 w-5" />
          <div className="flex items-center space-x-2">
            <span>{organizationName}</span>
          </div>
        </div>
        <Button asChild size="sm" variant="ghost">
          <Link href="/admin" className="flex items-center space-x-2">
            <Undo2Icon className="h-4 w-4" />
            Admin
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
