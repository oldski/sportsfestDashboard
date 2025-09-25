import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

export type TeamSignupNotificationEmailProps = {
  appName: string;
  organizationName: string;
  playerName: string;
  playerEmail: string;
  eventYearName: string;
};

export function TeamSignupNotificationEmail({
  appName,
  organizationName,
  playerName,
  playerEmail,
  eventYearName
}: TeamSignupNotificationEmailProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>
        New team member signup for {organizationName}
      </Preview>
      <Tailwind>
        <Body className="m-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              New Team Member Signup
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hello,
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              A new member has signed up to join <strong>{organizationName}</strong> for <strong>{eventYearName}</strong>.
            </Text>
            <Section className="my-[32px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
              <Text className="m-0 mb-2 text-[16px] font-semibold text-black">
                Player Details:
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-black">
                <strong>Name:</strong> {playerName}
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-black">
                <strong>Email:</strong> {playerEmail}
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-black">
                <strong>Event Year:</strong> {eventYearName}
              </Text>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              You can view and manage this new member in your {appName} dashboard.
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              This notification was sent because you are an administrator for {organizationName}.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}