'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMDXComponent } from '@content-collections/mdx/react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@workspace/ui/components/accordion';
import {
  UnderlinedTabs,
  UnderlinedTabsContent,
  UnderlinedTabsList,
  UnderlinedTabsTrigger
} from '@workspace/ui/components/tabs';
import { cn } from '@workspace/ui/lib/utils';

import { Callout } from '~/components/blog/callout';

const components = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        'font-heading mt-2 scroll-m-24 text-4xl font-bold',
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        'font-heading mb-4 mt-12 scroll-m-24 text-2xl font-semibold leading-8 tracking-tight',
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        'font-heading mt-8 scroll-m-24 text-xl font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn(
        'font-heading mt-8 scroll-m-24 text-lg font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5
      className={cn(
        'mt-8 scroll-m-24 text-base font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6
      className={cn(
        'mt-8 scroll-m-24 text-sm font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a
      className={cn(
        'font-medium text-blue-500 underline underline-offset-4',
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn('mt-6 leading-7', className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn('my-6 ml-6 list-disc', className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn('my-6 ml-6 list-decimal', className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <li
      className={cn('mt-2', className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={cn('mt-6 border-l-2 pl-6 italic', className)}
      {...props}
    />
  ),
  img: ({
    className,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      className={cn('rounded-md', className)}
      alt={alt}
      {...props}
    />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr
      className="my-4 md:my-8"
      {...props}
    />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto rounded-none">
      <table
        className={cn('w-full overflow-hidden rounded-none', className)}
        {...props}
      />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={cn('m-0 border-t p-0', className)}
      {...props}
    />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        'border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        'border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <pre
      className={cn(
        'relative mt-4 max-w-[calc(100svw-64px)] overflow-x-auto rounded-sm bg-muted px-1 py-2 font-mono text-sm',
        className
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        'relative rounded-sm bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
        className
      )}
      {...props}
    />
  ),
  Accordion,
  AccordionContent: ({
    className,
    ...props
  }: React.ComponentProps<typeof AccordionContent>) => (
    <AccordionContent
      className={cn('[&>p]:m-0', className)}
      {...props}
    />
  ),
  AccordionItem,
  AccordionTrigger,
  Callout,
  Image,
  Tabs: ({
    className,
    ...props
  }: React.ComponentProps<typeof UnderlinedTabs>) => (
    <UnderlinedTabs
      className={cn('relative mt-6 w-full', className)}
      {...props}
    />
  ),
  TabsList: ({
    className,
    ...props
  }: React.ComponentProps<typeof UnderlinedTabsList>) => (
    <UnderlinedTabsList
      className={cn('w-full border-b', className)}
      {...props}
    />
  ),
  TabsTrigger: ({
    className,
    ...props
  }: React.ComponentProps<typeof UnderlinedTabsTrigger>) => (
    <UnderlinedTabsTrigger
      className={cn('', className)}
      {...props}
    />
  ),
  TabsContent: ({
    className,
    ...props
  }: React.ComponentProps<typeof UnderlinedTabsContent>) => (
    <UnderlinedTabsContent
      className={cn('p-4', className)}
      {...props}
    />
  ),
  Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn('font-medium underline underline-offset-4', className)}
      {...props}
    />
  ),
  LinkedCard: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn(
        'flex w-full flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow transition-colors hover:bg-muted/50 sm:p-10',
        className
      )}
      {...props}
    />
  )
};

type MdxProps = {
  code: string;
};

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code);
  return (
    <div className="mdx">
      <Component components={components} />
    </div>
  );
}
