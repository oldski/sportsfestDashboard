import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

export type JoinRequestApprovedEmailProps = {
  appName: string;
  organizationName: string;
  dashboardLink: string;
};

export function JoinRequestApprovedEmail({
  appName,
  organizationName,
  dashboardLink
}: JoinRequestApprovedEmailProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to {organizationName}!
      </Preview>
      <Tailwind>
        <Body className="m-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Welcome to <strong>{organizationName}</strong>!
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hello,
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              Great news! Your request to join <strong>{organizationName}</strong>{' '}
              on <strong>{appName}</strong> has been approved.
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              You now have access to the organization dashboard.
            </Text>
            <Section className="my-[32px] text-center">
              <Button
                href={dashboardLink}
                className="rounded-sm bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
              >
                Go to Dashboard
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              or copy and paste this URL into your browser:{' '}
              <Link
                href={dashboardLink}
                className="text-blue-600 no-underline"
              >
                {dashboardLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you did not request to join this organization, please contact support.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
