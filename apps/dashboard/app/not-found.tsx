'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { routes } from '@workspace/routes';
import { Button } from '@workspace/ui/components/button';
import Image from "next/image";

export default function NotFound(): React.JSX.Element {
  const router = useRouter();
  const handleGoBack = (): void => {
    router.back();
  };
  const handleBackToHome = (): void => {
    router.push(routes.marketing.Index);
  };
  return (
    <>
      <div className="fixed inset-0 z-0">
        <Image src="/assets/graphic-404.webp" alt="404 Not Found" width="1800" height="1098" className="h-full w-full object-cover" />
      </div>
      <div className="relative z-10">
        <div className="flex flex-col py-32 items-center justify-center text-center h-screen bg-black-100">
          <span className="text-[10rem] font-semibold leading-none">404</span>
          <h2 className="font-heading my-2 text-2xl font-bold">
            Something&apos;s missing
          </h2>
          <p>
            Sorry, the page you are looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={handleGoBack}
            >
              Go back
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleBackToHome}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
