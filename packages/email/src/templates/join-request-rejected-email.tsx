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

export type JoinRequestRejectedEmailProps = {
  appName: string;
  organizationName: string;
  reason?: string;
};

export function JoinRequestRejectedEmail({
  appName,
  organizationName,
  reason
}: JoinRequestRejectedEmailProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>
        Update on your request to join {organizationName}
      </Preview>
      <Tailwind>
        <Body className="m-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Join Request Update
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hello,
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              Your request to join <strong>{organizationName}</strong> on{' '}
              <strong>{appName}</strong> was not approved.
            </Text>
            {reason && (
              <>
                <Text className="text-[14px] leading-[24px] text-black">
                  <strong>Reason provided:</strong>
                </Text>
                <Section className="rounded bg-[#f4f4f4] p-[16px]">
                  <Text className="m-0 text-[14px] leading-[24px] text-black">
                    {reason}
                  </Text>
                </Section>
              </>
            )}
            <Text className="text-[14px] leading-[24px] text-black">
              If you believe this was a mistake, please contact the organizer
              directly.
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you did not request to join this organization, you can safely
              ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
