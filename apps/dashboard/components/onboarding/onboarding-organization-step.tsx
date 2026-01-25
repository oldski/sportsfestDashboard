'use client';

import * as React from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { TrashIcon, UploadIcon, Loader2Icon } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { PatternFormat } from 'react-number-format';

import { baseUrl, getPathname, routes } from '@workspace/routes';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@workspace/ui/components/form';
import { ImageDropzone } from '@workspace/ui/components/image-dropzone';
import { Input } from '@workspace/ui/components/input';
import { toast } from '@workspace/ui/components/sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';
import { useDebounce } from '@workspace/ui/hooks/use-debounce';
import { CenteredSpinner } from '@workspace/ui/components/spinner';

import { checkIfSlugIsAvailable } from '~/actions/organization/check-if-slug-is-available';
import {
  findExistingOrganizations,
  findOrganizationsByEmailDomain,
  type FoundOrganization,
} from '~/actions/organization/find-existing-organizations';
import { getUserPendingJoinRequests } from '~/actions/organization/request-to-join-organization';
import { NextButton } from '~/components/onboarding/next-button';
import type { OnboardingStepProps } from '~/components/onboarding/onboarding-step-props';
import { ExistingOrganizationPrompt } from '~/components/onboarding/existing-organization-prompt';
import { PendingJoinRequestNotice } from '~/components/onboarding/pending-join-request-notice';
import { CropPhotoModal } from '~/components/organizations/slug/settings/account/profile/crop-photo-modal';
import { US_STATES } from '~/lib/constants';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '~/lib/file-upload';
import { type CompleteOnboardingSchema } from '~/schemas/onboarding/complete-onboarding-schema';

function slugify(str: string): string {
  return str
    .trim()
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export type OnboardingOrganizationStepProps =
  React.HtmlHTMLAttributes<HTMLDivElement> & OnboardingStepProps;

type ViewMode = 'form' | 'existing-orgs' | 'pending-requests';

interface PendingRequest {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  organizationLogo: string | null;
  status: string;
  createdAt: Date;
}

export function OnboardingOrganizationStep({
  canNext,
  loading,
  isLastStep,
  handleNext,
  className,
  ...other
}: OnboardingOrganizationStepProps): React.JSX.Element {
  const methods = useFormContext<CompleteOnboardingSchema>();
  const logo = methods.watch('organizationStep.logo');
  const slug = methods.watch('organizationStep.slug');
  const orgName = methods.watch('organizationStep.name');

  // Duplicate detection state
  const [viewMode, setViewMode] = React.useState<ViewMode>('form');
  const [existingOrgs, setExistingOrgs] = React.useState<FoundOrganization[]>([]);
  const [pendingRequests, setPendingRequests] = React.useState<PendingRequest[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isCheckingInitial, setIsCheckingInitial] = React.useState(true);
  const [hasCheckedForDuplicates, setHasCheckedForDuplicates] = React.useState(false);
  const [skipDuplicateCheck, setSkipDuplicateCheck] = React.useState(false);

  const debouncedOrgName = useDebounce(orgName, 500);
  const debouncedSlug = useDebounce(slug, 500);

  // Slug availability state
  const [isSlugAvailable, setIsSlugAvailable] = React.useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = React.useState(false);

  // Check for pending requests and email domain matches on mount
  React.useEffect(() => {
    const checkInitialState = async () => {
      setIsCheckingInitial(true);
      try {
        // First check for pending requests
        const requests = await getUserPendingJoinRequests();
        setPendingRequests(requests);
        if (requests.length > 0) {
          setViewMode('pending-requests');
          return;
        }

        // If no pending requests, check for email domain matches
        const domainMatches = await findOrganizationsByEmailDomain();
        if (domainMatches.length > 0) {
          setExistingOrgs(domainMatches);
          setHasCheckedForDuplicates(true);
          setViewMode('existing-orgs');
        }
      } catch (error) {
        console.error('Failed to check initial state:', error);
      } finally {
        setIsCheckingInitial(false);
      }
    };
    checkInitialState();
  }, []);

  // Search for existing organizations when name changes
  React.useEffect(() => {
    if (skipDuplicateCheck || !debouncedOrgName || debouncedOrgName.length < 3) {
      setExistingOrgs([]);
      return;
    }

    const searchOrgs = async () => {
      setIsSearching(true);
      try {
        const orgs = await findExistingOrganizations(debouncedOrgName);
        setExistingOrgs(orgs);
        setHasCheckedForDuplicates(true);
      } catch (error) {
        console.error('Failed to search organizations:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchOrgs();
  }, [debouncedOrgName, skipDuplicateCheck]);

  // Check slug availability when it changes
  React.useEffect(() => {
    if (!debouncedSlug || debouncedSlug.length < 2) {
      setIsSlugAvailable(null);
      return;
    }

    let cancelled = false;

    const checkSlug = async () => {
      setIsCheckingSlug(true);
      try {
        const result = await checkIfSlugIsAvailable({ slug: debouncedSlug });
        if (cancelled) return;
        setIsSlugAvailable(result?.data?.isAvailable ?? false);
      } catch (error) {
        console.error('Failed to check slug availability:', error);
        if (!cancelled) {
          setIsSlugAvailable(null);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingSlug(false);
        }
      }
    };

    checkSlug();

    return () => {
      cancelled = true;
    };
  }, [debouncedSlug]);

  const handleDrop = async (files: File[]): Promise<void> => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(
          `Uploaded image shouldn't exceed ${MAX_IMAGE_SIZE / 1000000} MB size limit`
        );
      } else {
        const base64Image: string = await NiceModal.show(CropPhotoModal, {
          file,
          aspectRatio: undefined,
          circularCrop: false
        });
        if (base64Image) {
          methods.setValue('organizationStep.logo', base64Image);
        }
      }
    }
  };

  const handleRemoveLogo = (): void => {
    methods.setValue('organizationStep.logo', undefined, {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  const handleContinueWithNew = () => {
    setSkipDuplicateCheck(true);
    setViewMode('form');
    setExistingOrgs([]);
  };

  const handleRequestSent = async () => {
    // Refresh pending requests
    const requests = await getUserPendingJoinRequests();
    setPendingRequests(requests);
    setViewMode('pending-requests');
  };

  const handleRequestCancelled = async () => {
    const requests = await getUserPendingJoinRequests();
    setPendingRequests(requests);
    if (requests.length === 0) {
      setViewMode('form');
    }
  };

  // Show pending requests view
  if (viewMode === 'pending-requests' && pendingRequests.length > 0) {
    return (
      <div
        className={cn('flex w-full flex-col gap-4', className)}
        {...other}
      >
        <h1 className="text-xl font-semibold leading-none tracking-tight lg:text-2xl">
          Pending Join Requests
        </h1>
        <p className="text-sm text-muted-foreground lg:text-base">
          You've requested to join an organization. We're waiting for the admin to approve.
        </p>
        <PendingJoinRequestNotice
          requests={pendingRequests}
          onRequestCancelled={handleRequestCancelled}
          onContinueWithNew={handleContinueWithNew}
        />
      </div>
    );
  }

  // Show existing organizations view
  if (viewMode === 'existing-orgs' || (existingOrgs.length > 0 && !skipDuplicateCheck && hasCheckedForDuplicates)) {
    return (
      <div
        className={cn('flex w-full flex-col gap-4', className)}
        {...other}
      >
        <h1 className="text-xl font-semibold leading-none tracking-tight lg:text-2xl">
          Is this your organization?
        </h1>
        <p className="text-sm text-muted-foreground lg:text-base">
          We found some organizations that might match. Would you like to join one of them instead?
        </p>
        <ExistingOrganizationPrompt
          organizations={existingOrgs}
          onContinueWithNew={handleContinueWithNew}
          onRequestSent={handleRequestSent}
        />
      </div>
    );
  }

  // Show main form
  return (
    <div
      className={cn('relative flex w-full flex-col gap-4', className)}
      {...other}
    >
      {isCheckingInitial && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
          <div className="flex flex-col items-center gap-2">
            <CenteredSpinner size="large" containerClassName="relative opacity-100" />
            <p className="text-sm text-muted-foreground">Checking for existing organizations...</p>
          </div>
        </div>
      )}
      <h1 className="text-xl font-semibold leading-none tracking-tight lg:text-2xl">
        Add your organization
      </h1>
      <p className="text-sm text-muted-foreground lg:text-base">
        We just need some basic info to get your organization set up. You'll be
        able to edit this later.
      </p>
      <div className="space-y-2">
        <FormLabel>Logo</FormLabel>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <ImageDropzone
              accept={ACCEPTED_IMAGE_TYPES}
              onDrop={handleDrop}
              src={logo}
              borderRadius="xl"
              className="size-20 rounded-xl p-0.5"
            >
              <Avatar className="size-[72px] rounded-md">
                <AvatarFallback className="size-[72px] rounded-md text-2xl">
                  <UploadIcon className="size-5 shrink-0 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </ImageDropzone>
            {!!logo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute bottom-[-12px] right-[-12px] z-10 rounded-full bg-background p-1"
                    onClick={handleRemoveLogo}
                  >
                    <TrashIcon className="size-4 shrink-0" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Remove logo</TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm">Upload your logo</span>
            <span className="text-xs text-muted-foreground">
              *.png, *.jpeg files up to 5 MB
            </span>
          </div>
        </div>
      </div>
      <FormField
        control={methods.control}
        name="organizationStep.name"
        render={({ field }) => (
          <FormItem className="flex w-full flex-col">
            <FormLabel required>Organization name</FormLabel>
            <FormControl>
              <Input
                type="text"
                maxLength={64}
                required
                disabled={methods.formState.isSubmitting}
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  methods.setValue(
                    'organizationStep.slug',
                    slugify(e.target.value ?? ''),
                    { shouldValidate: true }
                  );
                }}
              />
            </FormControl>
            {slug && (
              <FormDescription className={cn(
                "break-all",
                isSlugAvailable === false && "text-destructive"
              )}>
                Your dashboard URL will be:{' '}
                {getPathname(
                  routes.dashboard.organizations.Index,
                  baseUrl.Dashboard
                )}
                /{slug}
              </FormDescription>
            )}
            {isCheckingSlug && (
              <FormDescription className="flex items-center gap-1 text-muted-foreground">
                <Loader2Icon className="h-3 w-3 animate-spin" />
                Checking availability...
              </FormDescription>
            )}
            {isSlugAvailable === false && !isCheckingSlug && (
              <div className="space-y-2">
                <p className="text-sm text-destructive">
                  This organization name is already registered. Please choose a different name or request to join the existing organization.
                </p>
                {skipDuplicateCheck && (
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-sm"
                    onClick={() => {
                      setSkipDuplicateCheck(false);
                      setIsSlugAvailable(null);
                      methods.clearErrors('organizationStep.slug');
                    }}
                  >
                    Search for existing organizations to join
                  </Button>
                )}
              </div>
            )}
            {isSearching && !skipDuplicateCheck && (
              <FormDescription className="flex items-center gap-1 text-muted-foreground">
                <Loader2Icon className="h-3 w-3 animate-spin" />
                Checking for similar organizations...
              </FormDescription>
            )}
            {(methods.formState.touchedFields.organizationStep?.name ||
              methods.formState.submitCount > 0) && <FormMessage />}
          </FormItem>
        )}
      />

      {/* Hidden slug field - auto-generated from organization name */}
      <FormField
        control={methods.control}
        name="organizationStep.slug"
        render={({ field }) => (
          <input type="hidden" {...field} />
        )}
      />

      <FormField
        control={methods.control}
        name="organizationStep.address"
        render={({ field }) => (
          <FormItem className="flex w-full flex-col">
            <FormLabel required>Address</FormLabel>
            <FormControl>
              <Input
                type="text"
                maxLength={255}
                required
                placeholder="123 Main Street"
                disabled={methods.formState.isSubmitting}
                {...field}
              />
            </FormControl>
            {(methods.formState.touchedFields.organizationStep?.address ||
              methods.formState.submitCount > 0) && <FormMessage />}
          </FormItem>
        )}
      />

      <FormField
        control={methods.control}
        name="organizationStep.address2"
        render={({ field }) => (
          <FormItem className="flex w-full flex-col">
            <FormLabel>Address 2</FormLabel>
            <FormControl>
              <Input
                type="text"
                maxLength={255}
                placeholder="Apt, suite, etc. (optional)"
                disabled={methods.formState.isSubmitting}
                {...field}
              />
            </FormControl>
            {(methods.formState.touchedFields.organizationStep?.address2 ||
              methods.formState.submitCount > 0) && <FormMessage />}
          </FormItem>
        )}
      />

      <div className="flex w-full  gap-4">
        <FormField
          control={methods.control}
          name="organizationStep.city"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel required>City</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  maxLength={100}
                  required
                  placeholder="St. Petersburg"
                  disabled={methods.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={methods.control}
          name="organizationStep.state"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel required>State</FormLabel>
              <FormControl>
                <Select
                  disabled={methods.formState.isSubmitting}
                  onValueChange={field.onChange}
                  value={field.value}
                  name={field.name}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="FL" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>States</SelectLabel>
                      {US_STATES.map((abbr) => (
                        <SelectItem key={abbr} value={abbr}>
                          {abbr}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              {(methods.formState.touchedFields.organizationStep?.state ||
                methods.formState.submitCount > 0) && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={methods.control}
          name="organizationStep.zip"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel required>Zip Code</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  maxLength={10}
                  required
                  placeholder="33701"
                  disabled={methods.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              {(methods.formState.touchedFields.organizationStep?.zip ||
                methods.formState.submitCount > 0) && <FormMessage />}
            </FormItem>
          )}
        />
      </div>

      <FormItem className="flex w-full flex-col">
        <FormLabel required>Phone</FormLabel>
        <FormControl>
          <Controller
            name="organizationStep.phone"
            control={methods.control}
            render={({ field }) => (
              <PatternFormat
                format="(###) ###-####"
                mask="_"
                allowEmptyFormatting
                customInput={Input}
                value={field.value}
                onValueChange={(values) => {
                  field.onChange(values.value);
                }}
                disabled={methods.formState.isSubmitting}
              />
            )}
          />
        </FormControl>
        {(methods.formState.touchedFields.organizationStep?.phone ||
          methods.formState.submitCount > 0) && <FormMessage />}
      </FormItem>

      <NextButton
        loading={loading || isCheckingSlug || isCheckingInitial}
        disabled={!canNext || isSlugAvailable === false || isCheckingSlug || isCheckingInitial}
        isLastStep={isLastStep}
        onClick={handleNext}
      />
    </div>
  );
}
