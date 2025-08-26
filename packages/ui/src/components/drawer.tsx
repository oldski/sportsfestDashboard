'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '../lib/utils';

export type DrawerElement = React.ComponentRef<typeof DrawerPrimitive.Root>;
export type DrawerProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Root
>;
function Drawer(props: DrawerProps): React.JSX.Element {
  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      {...props}
    />
  );
}

export type DrawerTriggerElement = React.ComponentRef<
  typeof DrawerPrimitive.Trigger
>;
export type DrawerTriggerProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Trigger
>;
function DrawerTrigger(props: DrawerTriggerProps): React.JSX.Element {
  return (
    <DrawerPrimitive.Trigger
      data-slot="drawer-trigger"
      {...props}
    />
  );
}

export type DrawerPortalElement = React.ComponentRef<
  typeof DrawerPrimitive.Portal
>;
export type DrawerPortalProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Portal
>;
function DrawerPortal(props: DrawerPortalProps): React.JSX.Element {
  return (
    <DrawerPrimitive.Portal
      data-slot="drawer-portal"
      {...props}
    />
  );
}

export type DrawerCloseElement = React.ComponentRef<
  typeof DrawerPrimitive.Close
>;
export type DrawerCloseProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Close
>;
function DrawerClose(props: DrawerCloseProps): React.JSX.Element {
  return (
    <DrawerPrimitive.Close
      data-slot="drawer-close"
      {...props}
    />
  );
}

export type DrawerOverlayElement = React.ComponentRef<
  typeof DrawerPrimitive.Overlay
>;
export type DrawerOverlayProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Overlay
>;
function DrawerOverlay({
  className,
  ...props
}: DrawerOverlayProps): React.JSX.Element {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        'fill-mode-forwards! data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className
      )}
      {...props}
    />
  );
}

export type DrawerContentElement = React.ComponentRef<
  typeof DrawerPrimitive.Content
>;
export type DrawerContentProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Content
>;
function DrawerContent({
  className,
  children,
  ...props
}: DrawerContentProps): React.JSX.Element {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'group/drawer-content bg-background fixed z-50 flex h-auto flex-col',
          'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b',
          'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t',
          'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm',
          'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm',
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

export type DrawerHeaderElement = React.ComponentRef<'div'>;
export type DrawerHeaderProps = React.ComponentPropsWithoutRef<'div'>;
function DrawerHeader({
  className,
  ...props
}: DrawerHeaderProps): React.JSX.Element {
  return (
    <div
      data-slot="drawer-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  );
}

export type DrawerFooterElement = React.ComponentRef<'div'>;
export type DrawerFooterProps = React.ComponentPropsWithoutRef<'div'>;
function DrawerFooter({
  className,
  ...props
}: DrawerFooterProps): React.JSX.Element {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

export type DrawerTitleElement = React.ComponentRef<
  typeof DrawerPrimitive.Title
>;
export type DrawerTitleProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Title
>;
function DrawerTitle({
  className,
  ...props
}: DrawerTitleProps): React.JSX.Element {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  );
}

export type DrawerDescriptionElement = React.ComponentRef<
  typeof DrawerPrimitive.Description
>;
export type DrawerDescriptionProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Description
>;
function DrawerDescription({
  className,
  ...props
}: DrawerDescriptionProps): React.JSX.Element {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription
};
