import * as React from 'react';
import type { Metadata } from 'next';

import { Contact } from '~/components/sections/contact';
import { FAQ } from '~/components/sections/faq';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Contact')
};

export default function ContactPage(): React.JSX.Element {
  return (
    <>
      <Contact />
      <FAQ />
    </>
  );
}
