'use client';

import * as React from 'react';
import { CheckIcon, CopyIcon, LinkIcon, MailIcon, QrCodeIcon, ShareIcon, XIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';

import { Button } from '@workspace/ui/components/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@workspace/ui/components/drawer';
import { toast } from '@workspace/ui/components/sonner';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';

import { generateSignupQr } from '~/actions/organizations/generate-signup-qr';

interface SignupShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug: string;
  organizationName: string;
  eventYearName: string;
  eventDate: Date;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
}

export function SignupShareModal({
  open,
  onOpenChange,
  organizationSlug,
  organizationName,
  eventYearName,
  eventDate,
  locationName,
  address,
  city,
  state,
  zipCode,
  latitude,
  longitude
}: SignupShareModalProps) {
  const [copiedUrl, setCopiedUrl] = React.useState(false);
  const [copiedImage, setCopiedImage] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { execute: generateQr, result, isPending } = useAction(generateSignupQr);

  // Generate QR code when modal opens
  React.useEffect(() => {
    if (open && !result?.data) {
      console.log('Generating QR for:', organizationSlug);
      console.log('Input object:', { organizationSlug });
      console.log('organizationSlug type:', typeof organizationSlug);
      console.log('organizationSlug length:', organizationSlug?.length);
      generateQr({ organizationSlug });
    }
  }, [open, organizationSlug, generateQr, result?.data]);

  // Log any action errors
  React.useEffect(() => {
    if (result?.serverError) {
      console.error('Server error generating QR:', result.serverError);
    }
    if (result?.validationErrors) {
      console.error('Validation error generating QR:', result.validationErrors);
      console.error('Full validation errors:', JSON.stringify(result.validationErrors, null, 2));
    }
  }, [result?.serverError, result?.validationErrors]);

  const copyUrlToClipboard = async () => {
    if (!result?.data?.signupUrl) return;

    try {
      await navigator.clipboard.writeText(result.data.signupUrl);
      setCopiedUrl(true);
      toast.success('Signup URL copied to clipboard!');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const copyImageToClipboard = async () => {
    if (!result?.data?.qrDataUri) return;

    try {
      // Convert data URI to blob
      const response = await fetch(result.data.qrDataUri);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      setCopiedImage(true);
      toast.success('QR code image copied to clipboard!', {
        description: 'You can now paste it into emails, documents, or messages.'
      });
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (error) {
      toast.error('Failed to copy QR image', {
        description: 'Try right-clicking the QR code and selecting "Copy Image".'
      });
    }
  };

  const downloadQrCode = () => {
    if (!result?.data?.qrDataUri) return;

    const link = document.createElement('a');
    link.download = `${organizationSlug}-signup-qr.png`;
    link.href = result.data.qrDataUri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('QR code downloaded!');
  };

  const shareViaEmail = () => {
    if (!result?.data?.signupUrl) return;

    // Format the event date
    const eventDateFormatted = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Build full address
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;

    // Build Google Maps URL
    const mapsUrl = latitude && longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : '';

    // Build email subject and body
    const subject = `Join ${organizationName}'s ${eventYearName} Team!`;

    const body = `We're building our team for ${eventYearName} and would love to have you join us!

Event Details:
Date: ${eventDateFormatted}
Location: ${locationName}
Address: ${fullAddress}${mapsUrl ? `\nGet Directions: ${mapsUrl}` : ''}

Ready to sign up? Click here:
${result.data.signupUrl}

See you on the beach!`;

    // Create mailto URL
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open email client
    window.location.href = mailtoUrl;

    toast.success('Opening email client...');
  };

  const Content = () => (
    <div className="space-y-6">
      {/* QR Code Display */}
      <div className="flex flex-col items-center space-y-4">
        {isPending ? (
          <div className="w-[250px] h-[250px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
            <QrCodeIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        ) : result?.data?.qrDataUri ? (
          <div className="p-3 bg-white rounded-lg shadow-sm border">
            <img
              src={result.data.qrDataUri}
              alt="Team signup QR code"
              width={250}
              height={250}
              className="block"
            />
          </div>
        ) : (
          <div className="w-[250px] h-[250px] bg-muted rounded-lg flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Failed to generate QR code</p>
          </div>
        )}

        <div className="text-center space-y-2">
          <p className="font-medium">Team Member Signup</p>
          <p className="text-sm text-muted-foreground">
            Share this QR code for easy mobile signup
          </p>
        </div>
      </div>

      {/* Sharing Options */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={copyUrlToClipboard}
            disabled={!result?.data?.signupUrl || copiedUrl}
            className="justify-start"
          >
            {copiedUrl ? (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                URL Copied!
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={copyImageToClipboard}
            disabled={!result?.data?.qrDataUri || copiedImage}
            className="justify-start"
          >
            {copiedImage ? (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                QR Copied!
              </>
            ) : (
              <>
                <CopyIcon className="h-4 w-4 mr-2" />
                Copy QR Image
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={shareViaEmail}
            disabled={!result?.data?.signupUrl}
            className="justify-start"
          >
            <MailIcon className="h-4 w-4 mr-2" />
            Share via Email
          </Button>

          <Button
            variant="outline"
            onClick={downloadQrCode}
            disabled={!result?.data?.qrDataUri}
            className="justify-start"
          >
            <QrCodeIcon className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </div>

      {/* URL Display */}
      {result?.data?.signupUrl && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-xs font-medium text-muted-foreground mb-1">Signup URL:</p>
          <p className="text-sm font-mono break-all">{result.data.signupUrl}</p>
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShareIcon className="h-5 w-5" />
              Share Team Signup
            </DialogTitle>
            <DialogDescription>
              Generate and share a QR code or link for team member registration.
            </DialogDescription>
          </DialogHeader>
          <Content />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] !mt-12">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <ShareIcon className="h-5 w-5" />
            Share Team Signup
          </DrawerTitle>
          <DrawerClose className="absolute right-4 top-4">
            <XIcon className="h-4 w-4" />
          </DrawerClose>
        </DrawerHeader>
        <div className="px-4 pb-12 pb-safe">
          <Content />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
