'use client';

import * as React from 'react';
import Link from 'next/link';

import { APP_NAME } from '@workspace/common/app';
import { Separator } from '@workspace/ui/components/separator';
import { ThemeSwitcher } from '@workspace/ui/components/theme-switcher';

import { FOOTER_LINKS, SOCIAL_LINKS } from '~/components/marketing-links';
import {ExternalIcon} from "next/dist/client/components/react-dev-overlay/ui/icons/external";

export function Footer(): React.JSX.Element {
  return (
    <footer className="relative md:fixed bottom-0 w-full px-2 py-4 z-10 backdrop-blur-xs border-t border-foreground/20 backdrop-brightness-105 dark:backdrop-brightness-50">
      <h2 className="sr-only">Footer</h2>
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <ul className="flex flex-row flex-wrap gap-4 text-sm">
              <li>
                <p>
                  © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                </p>
              </li>
              {FOOTER_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    title={link.name}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="relative text-sm text-foreground transition-colors hover:text-muted-foreground flex flex-row gap-2 items-center"
                  >
                    {link.name}
                    {link.external && <ExternalIcon />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-row items-center gap-4">
            {SOCIAL_LINKS.map((link) => (
              <Link
                key={link.name}
                title={link.name}
                href={link.href}
                className="text-foreground transition-colors hover:text-muted-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">{link.name}</span>
                {link.icon}
              </Link>
            ))}
            <Separator
              orientation="vertical"
              className="h-4"
            />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
