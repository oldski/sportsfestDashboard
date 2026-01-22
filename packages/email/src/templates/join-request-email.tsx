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

export type JoinRequestEmailProps = {
  appName: string;
  requesterName: string;
  requesterEmail: string;
  organizationName: string;
  message?: string;
  reviewLink: string;
};

export function JoinRequestEmail({
  appName,
  requesterName,
  requesterEmail,
  organizationName,
  message,
  reviewLink
}: JoinRequestEmailProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>
        {requesterName} wants to join {organizationName}
      </Preview>
      <Tailwind>
        <Body className="m-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              New Join Request for <strong>{organizationName}</strong>
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hello,
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              <strong>{requesterName}</strong> (
              <Link
                href={`mailto:${requesterEmail}`}
                className="text-blue-600 no-underline"
              >
                {requesterEmail}
              </Link>
              ) has requested to join <strong>{organizationName}</strong> on{' '}
              <strong>{appName}</strong>.
            </Text>
            {message && (
              <>
                <Text className="text-[14px] leading-[24px] text-black">
                  <strong>Message from {requesterName}:</strong>
                </Text>
                <Section className="rounded bg-[#f4f4f4] p-[16px]">
                  <Text className="m-0 text-[14px] leading-[24px] text-black">
                    {message}
                  </Text>
                </Section>
              </>
            )}
            <Section className="my-[32px] text-center">
              <Button
                href={reviewLink}
                className="rounded-sm bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
              >
                Review Request
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              or copy and paste this URL into your browser:{' '}
              <Link
                href={reviewLink}
                className="text-blue-600 no-underline"
              >
                {reviewLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              You are receiving this email because you are an admin of{' '}
              {organizationName}.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
