import * as React from 'react';
import { BookIcon, CookieIcon, ScaleIcon } from 'lucide-react';

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
    title: 'What Are Cookies?',
    icon: <CookieIcon className="size-4 shrink-0" />,
    content:
      'Cookies are small text files that are stored on your device when you visit our website. They help us remember your preferences, keep you logged in, and understand how you use our platform to improve your experience at Tampa Bay Corporate SportsFest.'
  },
  {
    title: 'Why We Use Cookies',
    icon: <BookIcon className="size-4 shrink-0" />,
    content:
      'We use cookies to provide essential functionality like authentication for team captains and organization administrators, remember your display preferences, analyze website traffic through Google Analytics, process secure payments, and track the effectiveness of our email communications.'
  },
  {
    title: 'Your Cookie Choices',
    icon: <ScaleIcon className="size-4 shrink-0" />,
    content:
      'When you first visit our website, you will see a cookie consent banner where you can accept or decline non-essential cookies. You can change your cookie preferences at any time through your browser settings, though some features may not work properly if you disable certain cookies.'
  }
];

const DATA_ACCORDION = [
  {
    title: 'Essential Cookies (Strictly Necessary)',
    content:
      'These cookies are necessary for our website to function properly and cannot be disabled. They include: Authentication cookies that keep you logged into your account on dashboard.sportsfest.com, session cookies that maintain your registration form data as you navigate between pages, and security cookies that protect against fraudulent activity and ensure secure connections. Without these cookies, core features like event registration and team management would not work.'
  },
  {
    title: 'Preference Cookies (Functional)',
    content:
      'These cookies remember your choices and preferences to provide a more personalized experience. They include: Display mode preferences (dark/light theme settings), language preferences if applicable, and other customization settings you may select. These cookies enhance your user experience but are not strictly necessary for the website to function.'
  },
  {
    title: 'Analytics and Performance Cookies',
    content:
      'We use Google Analytics with demographic features enabled to understand how visitors interact with our website. These cookies collect information such as: pages you visit, time spent on pages, links you click, demographic information (age range, gender, interests), device and browser information, and general geographic location. This data is anonymized and aggregated to help us improve our website, understand user behavior, and make data-driven decisions about our platform and events. You can opt-out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on.'
  },
  {
    title: 'Marketing and Communication Cookies',
    content:
      'We use Constant Contact for email marketing communications. When you click links in our emails, cookies may be placed to track engagement and measure the effectiveness of our campaigns. This helps us understand which content is most valuable to our community and improve future communications. These cookies track: email open rates, link clicks, and user engagement with our email content. You can unsubscribe from marketing emails at any time using the unsubscribe link in any email.'
  },
  {
    title: 'Payment Processing Cookies',
    content:
      'When you make payments for event registrations, tent rentals, or other services, our payment processor Stripe may set cookies to securely process your transaction. These cookies are essential for: authenticating payment information, preventing fraudulent transactions, and ensuring PCI DSS compliance. Stripe\'s use of cookies is governed by their own privacy policy. We do not store your complete payment card information on our servers.'
  },
  {
    title: 'Third-Party Cookies and Services',
    content:
      'In addition to our own cookies, third-party services may set cookies on your device: Google Analytics (performance tracking and demographics), Constant Contact (email campaign tracking), Stripe (payment processing), and any embedded content such as videos or social media feeds. These third parties have their own privacy and cookie policies. We only work with trusted partners who are committed to data protection and privacy.'
  },
  {
    title: 'Cookie Duration and Storage',
    content:
      'We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device for a set period). Session cookies are used for essential functions like maintaining your login state during a browsing session. Persistent cookies are used for remembering preferences and may last from a few days to several years depending on their purpose. All cookie data is stored and processed within the United States in accordance with applicable data protection laws.'
  },
  {
    title: 'How to Manage Your Cookie Preferences',
    content:
      'You have several options for managing cookies: Use the cookie consent banner when you first visit our site to accept or decline non-essential cookies. Adjust your browser settings to block all cookies or only third-party cookies (instructions vary by browser - check your browser\'s help menu). Install browser extensions or plugins that manage cookie preferences. Opt-out of Google Analytics using their browser add-on. Please note that disabling essential cookies may prevent you from using certain features like registration and team management.'
  },
  {
    title: 'Do Not Track Signals',
    content:
      'Some browsers have "Do Not Track" (DNT) features that send signals to websites requesting not to be tracked. Currently, there is no universally accepted standard for how to respond to DNT signals. Our website does not currently respond to DNT signals, but you can use the cookie management options described above to control tracking.'
  },
  {
    title: 'Changes to This Cookie Policy',
    content:
      'Florida Corporate SportsFest, Inc. may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our practices. We will post any changes on this page with a new effective date. We encourage you to review this policy periodically. Your continued use of our website after changes are posted constitutes acceptance of the updated policy.'
  },
  {
    title: 'Contact Us About Cookies',
    content:
      'If you have questions about our use of cookies or this Cookie Policy, please contact us: Prem Persaud | Email: prem@sportsfest.com | Phone: 727.512.6619 ext 1'
  }
];

export function CookiePolicy(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container space-y-16 py-20">
        <div className="flex flex-col items-center gap-8">
          <Logo isFull={false} width={400} height={222} />
          <SiteHeading
            badge="Legal"
            title="Cookie Policy"
            description="Learn how Florida Corporate SportsFest, Inc. uses cookies and similar technologies to improve your experience. Effective Date: January 1, 2025"
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
