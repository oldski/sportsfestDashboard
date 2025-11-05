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
    title: 'Acceptance of Terms',
    icon: <BookIcon className="size-4 shrink-0" />,
    content:
      'By accessing or using the Tampa Bay Corporate SportsFest platform and services, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services or participate in our events.'
  },
  {
    title: 'Eligibility Requirements',
    icon: <ScaleIcon className="size-4 shrink-0" />,
    content:
      'You must be at least 18 years of age to register for and participate in SportsFest events. By registering, you confirm that all information provided is accurate and current. You are responsible for maintaining the confidentiality of your account credentials.'
  },
  {
    title: 'Event Participation',
    icon: <AlertCircleIcon className="size-4 shrink-0" />,
    content:
      'Participants acknowledge that SportsFest activities are potentially hazardous. You must be in proper physical condition to participate and assume all risks associated with participation, including falls, contact with other participants, and weather conditions.'
  }
];

const DATA_ACCORDION = [
  {
    title: 'Registration and Payment Terms',
    content:
      'Event registrations, tent rentals, and other services require payment as specified on our platform. All fees are due at the time of registration unless otherwise stated. Payment must be made through our secure payment processing system. Once submitted, all sales are final with no refunds; however, credits may be issued at our discretion for future events or services.'
  },
  {
    title: 'Cancellations and Credits',
    content:
      'Florida Corporate SportsFest, Inc. does not provide refunds for registrations, tent rentals, or other paid services. In certain circumstances, we may offer credits toward future events at our sole discretion. Event cancellations due to weather, acts of God, or other circumstances beyond our control do not entitle participants to refunds. We reserve the right to cancel or reschedule events and will work with participants to apply payments to future events.'
  },
  {
    title: 'Roster and Team Management',
    content:
      'Organization administrators and team captains are responsible for managing their rosters and ensuring that only registered participants compete in events. You may not permit individuals to participate who are not on your official roster or who are not registered with Corporate SportsFest. Violations may result in team disqualification and forfeiture of registration fees.'
  },
  {
    title: 'Waiver and Release of Liability',
    content:
      'By participating in SportsFest events, you acknowledge the inherent risks and voluntarily waive, release, and discharge Florida Corporate SportsFest, Inc., its affiliates, sponsors, agents, employees, and event officials from any and all liability for injuries, damages, or losses arising from your participation. This includes, but is not limited to, injuries from falls, contact with participants, equipment, weather conditions including lightning and heat, and any other event-related risks.'
  },
  {
    title: 'Photo and Video Consent',
    content:
      'By participating in SportsFest events, you grant Florida Corporate SportsFest, Inc. permission to use photographs, videotapes, or any other recordings of you for marketing, promotional, and social media purposes without compensation. If you object to being photographed or recorded, you must notify event staff on-site.'
  },
  {
    title: 'Alcohol and Prohibited Conduct',
    content:
      'Participants may not bring alcohol to any SportsFest event sites. Prohibited conduct includes: posting harmful or offensive content, harassment of other participants or staff, cheating or unsportsmanlike behavior, damaging event property or facilities, and any illegal activities. Violations may result in immediate removal from the event without refund and prohibition from future events.'
  },
  {
    title: 'Intellectual Property Rights',
    content:
      'All content on the SportsFest platform, including logos, trademarks, text, graphics, images, and software, is the property of Florida Corporate SportsFest, Inc. and is protected by copyright and trademark laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission. The "Tampa Bay Corporate SportsFest" name and logo are registered trademarks.'
  },
  {
    title: 'Limitation of Liability and Disclaimers',
    content:
      'Our platform and services are provided "as is" without warranties of any kind, either express or implied. Florida Corporate SportsFest, Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services or participation in events. Our total liability shall not exceed the amount you paid for registration or services. Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability, so these limitations may not apply to you.'
  },
  {
    title: 'Account Termination',
    content:
      'We reserve the right to suspend or terminate your account and access to our services at any time, with or without notice, for violations of these Terms of Use, fraudulent activity, non-payment, unsportsmanlike conduct, or any other reason at our sole discretion. Upon termination, your right to use our services immediately ceases.'
  },
  {
    title: 'Governing Law and Dispute Resolution',
    content:
      'These Terms of Use are governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law provisions. Any disputes arising from these terms or your use of our services shall be resolved in the state or federal courts located in Florida. You consent to the exclusive jurisdiction and venue of such courts.'
  },
  {
    title: 'Modifications to Terms',
    content:
      'Florida Corporate SportsFest, Inc. reserves the right to update or modify these Terms of Use at any time. Changes will be posted on our website with a new effective date. Your continued use of our services after changes are posted constitutes your acceptance of the updated terms. We encourage you to review these terms periodically.'
  },
  {
    title: 'Contact Information',
    content:
      'If you have questions about these Terms of Use, please contact us: Prem Persaud | Email: prem@sportsfest.com | Phone: 727.512.6619 ext 1'
  }
];

export function TermsOfUse(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container space-y-16 py-20">
        <div className="flex flex-col items-center gap-8">
          <Logo isFull={false} width={400} height={222} />
          <SiteHeading
            badge="Legal"
            title="Terms of Use"
            description="By accessing or using Tampa Bay Corporate SportsFest services, you agree to these terms. Please read carefully to understand your rights and responsibilities. Effective Date: January 1, 2025"
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
