'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Calendar } from '@workspace/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@workspace/ui/components/tooltip';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@workspace/ui/components/alert-dialog';
import { CalendarIcon, AlertCircleIcon, InfoIcon } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { SiteHeading } from "~/components/fragments/site-heading";
import {
  BackgroundSlideshow,
  EventInterestRanking,
  EventType,
  Gender,
  TShirtSize,
  GENDER_OPTIONS,
  TSHIRT_SIZE_OPTIONS
} from '~/components/team-signup';
import { motion } from "motion/react";
import {Logo} from "@workspace/ui/components/logo";

// API functions
const getOrganizationForSignup = async (slug?: string) => {
  if (!slug) return null;

  try {
    const response = await fetch(`/api/organization/${encodeURIComponent(slug)}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch organization');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
};

const submitTeamSignup = async (data: FormData) => {
  try {
    const response = await fetch('/api/team-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        dateOfBirth: data.dateOfBirth?.toISOString(),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to submit signup',
        status: response.status
      };
    }

    return {
      success: true,
      message: result.message,
      playerId: result.playerId
    };
  } catch (error) {
    console.error('Error submitting signup:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      status: 500
    };
  }
};

// Form validation schema
const formSchema = z.object({
  organizationId: z.string().min(1, 'Organization is required'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required'
  }),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  gender: z.nativeEnum(Gender),
  tshirtSize: z.nativeEnum(TShirtSize),
  confirmAccuracy: z.boolean().refine(val => val === true, 'You must confirm the accuracy of your information'),
  waiverAgreement: z.boolean().refine(val => val === true, 'You must agree to the waiver terms'),
  eventInterests: z.record(z.string(), z.number().min(1).max(5))
});

type FormData = z.infer<typeof formSchema>;

export default function TeamMemberSignupPage() {
  const searchParams = useSearchParams();
  const [organization, setOrganization] = React.useState<{ id: string; name: string; slug: string } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(new Date(new Date().getFullYear() - 25, 0));
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorDialog, setErrorDialog] = React.useState<{ title: string; message: string } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      eventInterests: {
        [EventType.BEACH_VOLLEYBALL]: 1,
        [EventType.TUG_OF_WAR]: 2,
        [EventType.CORN_TOSS]: 3,
        [EventType.BOTE_BEACH_CHALLENGE]: 4,
        [EventType.BEACH_DODGEBALL]: 5
      },
      confirmAccuracy: false,
      waiverAgreement: false
    }
  });

  // Load organization from URL parameter
  React.useEffect(() => {
    async function loadOrganization() {
      const orgSlug = searchParams.get('org');
      if (orgSlug) {
        const org = await getOrganizationForSignup(orgSlug);
        if (org) {
          setOrganization(org);
          form.setValue('organizationId', org.id);
        }
      }
      setIsLoading(false);
    }

    loadOrganization();
  }, [searchParams, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await submitTeamSignup(data);

      if (result.success) {
        setSuccessMessage(result.message);
        form.reset();
      } else {
        // Handle specific errors
        if (result.status === 409) {
          // Email already exists - show error on email field and keep form data
          form.setError('email', {
            type: 'manual',
            message: 'This email address is already registered for this event year'
          });
          setErrorDialog({
            title: 'Email Already Registered',
            message: 'A player with this email address already exists for this event year. Please use a different email address or contact support if this is an error.'
          });
        } else {
          // Other errors - show generic error dialog
          setErrorDialog({
            title: 'Registration Failed',
            message: result.error || 'Failed to register player. Please try again later or contact support.'
          });
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrorDialog({
        title: 'Network Error',
        message: 'Unable to submit your registration. Please check your internet connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full size-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if no valid organization
  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircleIcon className="size-5" />
              <span>Invalid Link</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                This signup link is invalid or the organization could not be found.
                Please contact your organization administrator for the correct signup link.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <BackgroundSlideshow />
      <div className="relative z-10 pb-24">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center min-h-[calc(100vh*2/3)] mb-8 flex flex-col justify-center">
            <motion.div
              initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
              animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col items-center gap-8"
            >
              <Logo isFull={false} width={400} height={222} />
            <SiteHeading
              badge="📩 You're Invited"
              title={`Join ${organization.name}`}
              description="No Athletic Skill Necessary, Just Team Spirit and Company Pride!"
            />
            </motion.div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <motion.div
              initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
              animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...form.register('firstName')}
                      className={form.formState.errors.firstName ? 'border-destructive' : ''}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...form.register('lastName')}
                      className={form.formState.errors.lastName ? 'border-destructive' : ''}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      className={form.formState.errors.email ? 'border-destructive' : ''}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register('phone')}
                      className={form.formState.errors.phone ? 'border-destructive' : ''}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Gender *</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Gender information helps us organize teams and ensure fair competition across events.
                              This information is kept confidential and used solely for event planning purposes.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Controller
                      name="gender"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={form.formState.errors.gender ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(GENDER_OPTIONS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.gender && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.gender.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>T-Shirt Size *</Label>
                    <Controller
                      name="tshirtSize"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={form.formState.errors.tshirtSize ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TSHIRT_SIZE_OPTIONS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.tshirtSize && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.tshirtSize.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Controller
                      name="dateOfBirth"
                      control={form.control}
                      render={({ field }) => (
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                                form.formState.errors.dateOfBirth && "border-destructive"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="flex items-center justify-between p-3 border-b">
                              <Select
                                value={calendarMonth.getMonth().toString()}
                                onValueChange={(value) => {
                                  const newMonth = new Date(calendarMonth);
                                  newMonth.setMonth(parseInt(value));
                                  setCalendarMonth(newMonth);
                                }}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i} value={i.toString()}>
                                      {format(new Date(2000, i), "MMMM")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={calendarMonth.getFullYear().toString()}
                                onValueChange={(value) => {
                                  const newMonth = new Date(calendarMonth);
                                  newMonth.setFullYear(parseInt(value));
                                  setCalendarMonth(newMonth);
                                }}
                              >
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 75 }, (_, i) => {
                                    const year = new Date().getFullYear() - 18 - i;
                                    return (
                                      <SelectItem key={year} value={year.toString()}>
                                        {year}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setIsCalendarOpen(false);
                              }}
                              month={calendarMonth}
                              onMonthChange={setCalendarMonth}
                              disabled={(date) => {
                                const today = new Date();
                                const minAge18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                                return date > today || date > minAge18;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
              animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
            <Card>
              <CardHeader>
                <CardTitle>Event Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="eventInterests"
                  control={form.control}
                  render={({ field }) => (
                    <EventInterestRanking
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.eventInterests?.message as string | undefined}
                    />
                  )}
                />
              </CardContent>
            </Card>
            </motion.div>

            <Card>
              <CardHeader>
                <CardTitle>Agreement & Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-2">
                  <Controller
                    name="confirmAccuracy"
                    control={form.control}
                    render={({ field }) => (
                      <Checkbox
                        id="confirmAccuracy"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="confirmAccuracy"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm that the information provided is accurate *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      You confirm that all information entered is correct to the best of your knowledge.
                    </p>
                    {form.formState.errors.confirmAccuracy && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.confirmAccuracy.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Controller
                    name="waiverAgreement"
                    control={form.control}
                    render={({ field }) => (
                      <Checkbox
                        id="waiverAgreement"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="waiverAgreement"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the waiver and release of liability *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      You understand and agree to participate in sports activities at your own risk.
                    </p>
                    {form.formState.errors.waiverAgreement && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.waiverAgreement.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                className="block"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Complete Registration'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-green-600">Registration Successful! 🎉</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>{successMessage}</p>
              <p className="text-sm text-muted-foreground">
                Get ready to be part of your company team! An email notification was sent to your Team Organizer.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Dialog */}
      <AlertDialog open={!!errorDialog} onOpenChange={() => setErrorDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {errorDialog?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
