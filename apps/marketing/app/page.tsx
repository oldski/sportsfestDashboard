'use client';

import * as React from 'react';
import Link from 'next/link';

import { routes } from '@workspace/routes';
import { Button } from '@workspace/ui/components/button';
import {Logo} from "@workspace/ui/components/logo";
import { motion } from "motion/react";
import {ExternalIcon} from "next/dist/client/components/react-dev-overlay/ui/icons/external";
import {ChevronRightIcon} from "lucide-react";

export default function IndexPage(): React.JSX.Element {
  return (
    <>
      <div className="fixed h-screen w-screen z-0">
        <video
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/video-corporate-sportsfest.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="relative flex flex-col items-center gap-8 h-screen justify-center z-10">
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: .8 }}
          className="flex flex-col items-center gap-6"
        >
          <Logo isFull={false} variant="light" width={400} height={222} />
          <div className="flex items-center gap-4">
            <Button asChild size="lg" variant="default">
              <Link href={routes.dashboard.auth.SignIn} className="group">
                SportsFest Dashboard
                <ChevronRightIcon className="ml-1.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="group">
              <a href="https://sportsfest.com" target="_blank" rel="noopener noreferrer">
                SportsFest
                <ExternalIcon className="ml-1.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
