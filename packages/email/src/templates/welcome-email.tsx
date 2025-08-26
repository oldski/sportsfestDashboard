import * as React from 'react';
import {
  Body,
  Button,
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

export type WelcomeEmailProps = {
  appName: string;
  name: string;
  getStartedLink: string;
};

export function WelcomeEmail({
  appName,
  name,
  getStartedLink
}: WelcomeEmailProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {appName}!</Preview>
      <Tailwind>
        <Body className="m-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Welcome to {appName}!
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hello {name},
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              Thank you for signing up! We're excited to have you on board. Your
              account has been successfully created, and you're ready to start
              exploring our platform.
            </Text>
            <Section className="my-[32px] text-center">
              <Button
                href={getStartedLink}
                className="rounded-sm bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
              >
                Get started
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              If you have any questions or need assistance, please don't
              hesitate to reach out to our support team.
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              You receive this email because you signed up on {appName}.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
