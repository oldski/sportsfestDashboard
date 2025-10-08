import * as React from "react";
import Link from "next/link";
import {routes} from "@workspace/routes";
import {Separator} from "@workspace/ui/components/separator";
import {ThemeSwitcher} from "@workspace/ui/components/theme-switcher";
import {APP_NAME} from "@workspace/common/app";

export function Footer() {
  return(
    <footer className="relative md:fixed md:bottom-0 w-full px-2 py-4 z-10 backdrop-blur-xs border-t border-foreground/20 backdrop-brightness-150 dark:backdrop-brightness-50 bg-white/30 dark:bg-black/30">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>


          <Separator
            orientation="vertical"
            className="h-4"
          />
          <div className="px-2">
            By signing up, you agree to our{' '}
            <Link
              prefetch={false}
              href={routes.marketing.TermsOfUse}
              className="text-foreground underline"
            >
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link
              prefetch={false}
              href={routes.marketing.PrivacyPolicy}
              className="text-foreground underline"
            >
              Privacy Policy
            </Link>
            . Need help?{' '}
            <Link
              prefetch={false}
              href={routes.marketing.Contact}
              className="text-foreground underline"
            >
              Get in touch
            </Link>
            .
          </div>

          <Separator
            orientation="vertical"
            className="h-4"
          />
          <ThemeSwitcher />
        </div>
      </div>

    </footer>
  )
}
