import * as React from 'react';
import { AlertCircleIcon, BookIcon, ScaleIcon } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@workspace/ui/components/accordion';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';

import { GridSection } from '~/components/fragments/grid-section';
import { SiteHeading } from '~/components/fragments/site-heading';
import {Logo} from "@workspace/ui/components/logo";
import {ContactCard} from "~/components/fragments/contact-card";

const DATA_CARDS = [
  {
    title: 'Who We Are',
    icon: <BookIcon className="size-4 shrink-0" />,
    content:
      'Florida Corporate SportsFest, Inc. operates Tampa Bay Corporate SportsFest, providing corporate sports events and team-building activities. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform or participate in our events.'
  },
  {
    title: 'Information We Collect',
    icon: <ScaleIcon className="size-4 shrink-0" />,
    content:
      'We collect personal information including your name, email, phone number, date of birth, gender, t-shirt size, and event preferences. We also collect company/organization details, payment information for registrations and services, and usage data through Google Analytics.'
  },
  {
    title: 'How We Use Your Data',
    icon: <AlertCircleIcon className="size-4 shrink-0" />,
    content:
      'We use your information to manage event registrations, process payments, coordinate team rosters, communicate event details, send marketing emails via Constant Contact, improve our services, and take photos/videos at events for promotional purposes.'
  }
];

const DATA_ACCORDION = [
  {
    title: 'Payment Processing',
    content:
      'We collect and process payment information for event registrations, tent rentals, and other services. Payment data is securely processed through trusted payment processors and is not stored on our servers. All financial transactions are encrypted and comply with industry standards.'
  },
  {
    title: 'Third-Party Service Providers',
    content:
      'We do not sell or share your personal data with third parties for their marketing purposes. However, we use trusted service providers to operate our platform: payment processors for secure transactions, Google Analytics to understand how our platform is used, and Constant Contact for sending event updates and marketing communications. These providers are contractually obligated to protect your data and use it only for the services they provide to us.'
  },
  {
    title: 'Photo and Video Usage',
    content:
      'By participating in SportsFest events, you grant us permission to use photographs, videotapes, or any other recordings of you taken during events for marketing, promotional, and social media purposes. If you do not wish to be photographed or recorded, please notify event staff on-site.'
  },
  {
    title: 'Data Security',
    content:
      'We implement industry-standard security measures including encryption, secure servers, and access controls to protect your personal information. While we strive to use commercially acceptable means to protect your data, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.'
  },
  {
    title: 'Your Rights and Choices',
    content:
      'You have the right to access, update, or delete your personal information at any time through your account dashboard or by contacting us. You can opt-out of marketing communications by clicking the unsubscribe link in our emails or by contacting us directly. You may also request a copy of the personal data we hold about you.'
  },
  {
    title: 'Cookies and Tracking Technologies',
    content:
      'We use Google Analytics and similar tracking technologies to analyze usage patterns, improve user experience, and understand how visitors interact with our platform. These tools may use cookies to collect information about your browsing behavior. You can control cookie settings through your browser preferences.'
  },
  {
    title: 'Data Retention',
    content:
      'We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Event participation data may be retained for historical record-keeping and to facilitate future event planning.'
  },
  {
    title: 'Children\'s Privacy',
    content:
      'Our services are intended for individuals who are 18 years of age or older. We do not knowingly collect personal information from individuals under 18. If you believe we have inadvertently collected information from someone under 18, please contact us immediately.'
  },
  {
    title: 'Changes to This Privacy Policy',
    content:
      'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the updated policy on our website with a new effective date. Your continued use of our services after changes are posted constitutes acceptance of the updated policy.'
  },
  {
    title: 'Contact Us',
    content:
      'If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us: Prem Persaud, Privacy Officer | Email: prem@sportsfest.com | Phone: 727.512.6619 ext 1'
  }
];

export function PrivacyPolicy(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container space-y-16 py-20">
        <div className="flex flex-col items-center gap-8">
          <Logo isFull={false} width={400} height={222} />
          <SiteHeading
            badge="Legal"
            title="Privacy Policy"
            description="Learn how Florida Corporate SportsFest, Inc. collects, uses, and protects your personal information. Effective Date: January 1, 2025"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DATA_CARDS.map((item, index) => (
            <Card
              key={index}
              className="border-none dark:bg-accent/40"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {item.icon}
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Accordion
          type="single"
          collapsible
        >
          {DATA_ACCORDION.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
            >
              <AccordionTrigger className="flex items-center justify-between text-lg font-medium">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <ContactCard />
      </div>
    </GridSection>
  );
}
