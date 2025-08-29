'use client';

import * as React from 'react';
import Link from 'next/link';
import { EyeIcon, HomeIcon } from 'lucide-react';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

export interface SuperAdminBannerProps {
  className?: string;
  organizationName: string;
}

export function SuperAdminBanner({ className, organizationName }: SuperAdminBannerProps): React.JSX.Element {

  return (
    <Alert className={cn('border-amber-600 bg-amber-400 text-amber-900 rounded-xl', className)}>
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <EyeIcon className="h-4 w-4" />
          <div className="flex items-center space-x-2">
            <span className="font-bold">Super Admin View:</span>
            <span>You are viewing {organizationName} organization</span>
          </div>
        </div>
        <Button asChild size="sm" variant="ghost" className="ml-4">
          <Link href="/admin" className="flex items-center space-x-2">
            <HomeIcon className="h-4 w-4" />
            Return to Admin
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
