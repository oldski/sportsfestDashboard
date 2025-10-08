'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

import { routes } from '@workspace/routes';
import { Button, buttonVariants } from '@workspace/ui/components/button';
import { Logo } from '@workspace/ui/components/logo';
import { Portal } from '@workspace/ui/components/portal';
import { ThemeSwitcher } from '@workspace/ui/components/theme-switcher';
import { RemoveScroll } from '@workspace/ui/lib/remove-scroll';
import { cn } from '@workspace/ui/lib/utils';


export function MobileMenu({
  className,
  ...other
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleRouteChangeStart = () => {
      if (document.activeElement instanceof HTMLInputElement) {
        document.activeElement.blur();
      }

      setOpen(false);
    };

    handleRouteChangeStart();
  }, [pathname]);

  const handleChange = () => {
    const mediaQueryList = window.matchMedia('(min-width: 1024px)');
    setOpen((open) => (open ? !mediaQueryList.matches : false));
  };

  React.useEffect(() => {
    handleChange();
    const mediaQueryList = window.matchMedia('(min-width: 1024px)');
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, []);

  const handleToggleMobileMenu = (): void => {
    setOpen((open) => !open);
  };

  return (
    <>
      <div
        className={cn('flex items-center justify-between', className)}
        {...other}
      >
        <Link href={routes.marketing.Index}>
          <Logo />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-expanded={open}
          aria-label="Toggle Mobile Menu"
          onClick={handleToggleMobileMenu}
          className="flex aspect-square h-fit select-none flex-col items-center justify-center rounded-full"
        >
          <motion.div
            className="w-5 origin-center border-t-2 border-primary"
            animate={
              open ? { rotate: '45deg', y: '5px' } : { rotate: '0deg', y: 0 }
            }
            transition={{ bounce: 0, duration: 0.1 }}
          />
          <motion.div
            className="w-5 origin-center border-t-2 border-primary"
            transition={{ bounce: 0, duration: 0.1 }}
            animate={
              open
                ? { rotate: '-45deg', y: '-5px' }
                : { rotate: '0deg', scaleX: 1, y: 0 }
            }
          />
        </Button>
      </div>
      {open && (
        <Portal asChild>
          <RemoveScroll
            allowPinchZoom
            enabled
          >
            <MainMobileMenu onLinkClicked={handleToggleMobileMenu} />
          </RemoveScroll>
        </Portal>
      )}
    </>
  );
}

type MainMobileMenuProps = {
  onLinkClicked: () => void;
};

function MainMobileMenu({
  onLinkClicked
}: MainMobileMenuProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 mt-[69px] overflow-y-auto bg-background animate-in fade-in-0">
      <div className="flex size-full flex-col items-start space-y-3 p-4">
        <div className="flex w-full flex-col gap-2">
          <Link
            href={routes.dashboard.auth.SignUp}
            className={cn(
              buttonVariants({
                variant: 'default',
                size: 'lg'
              }),
              'w-full rounded-xl'
            )}
            onClick={onLinkClicked}
          >
            Start for free
          </Link>
          <Link
            href={routes.dashboard.auth.SignIn}
            onClick={onLinkClicked}
            className={cn(
              buttonVariants({
                variant: 'outline',
                size: 'lg'
              }),
              'w-full rounded-xl'
            )}
          >
            Sign in
          </Link>
        </div>
        {/* Navigation links removed - not needed */}
        <div className="flex w-full items-center justify-between gap-2 border-y border-border/40 p-4">
          <div className="text-base font-medium">Theme</div>
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}

