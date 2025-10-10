'use client';

import * as React from 'react';
import Link from 'next/link';

import {baseUrl, routes} from '@workspace/routes';
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
          poster={`${baseUrl.Marketing}/assets/cover-video-corporate-sportsfest.png`}
          className="w-full h-full object-cover"
        >
          <source src={`${baseUrl.Marketing}/assets/video-corporate-sportsfest.mp4`} type="video/mp4" />
        </video>
      </div>
      <motion.div
        initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
        animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: .8 }}
        className="relative flex flex-col items-center gap-8 h-screen justify-center z-10 p-10"
      >
        <Logo isFull={false} variant="light" width={400} height={222} />
        <div className="flex flex-col md:flex-row justify-center md:gap-6 space-y-4 w-full md:w-auto">
          <Button asChild size="lg" variant="default" >
            <Link href={routes.dashboard.auth.SignIn} className="group">
              SportsFest Dashboard
              <ChevronRightIcon className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
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
    </>
  );
}
