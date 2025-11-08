'use client';

import * as React from 'react';
import {useParams} from 'next/navigation';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import {CalendarIcon, AlertCircleIcon, InfoIcon} from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { PatternFormat } from 'react-number-format';
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
import {Separator} from "@workspace/ui/components/separator";
import Image from "next/image";

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
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(10, 'Please enter a valid 10-digit phone number'),
  gender: z.nativeEnum(Gender),
  tshirtSize: z.nativeEnum(TShirtSize),
  confirmAccuracy: z.boolean().refine(val => val === true, 'You must confirm the accuracy of your information'),
  waiverAgreement: z.boolean().refine(val => val === true, 'You must agree to the waiver terms'),
  eventInterests: z.record(z.string(), z.number().min(1).max(5))
});

type FormData = z.infer<typeof formSchema>;

function TeamMemberSignupForm() {
  const params = useParams();
  const [organization, setOrganization] = React.useState<{ id: string; name: string; slug: string; logo?: string | null; activeEventYear?: { id: string; name: string } | null } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(new Date(new Date().getFullYear() - 25, 0));
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorDialog, setErrorDialog] = React.useState<{ title: string; message: string } | null>(null);
  const [isWaiverDialogOpen, setIsWaiverDialogOpen] = React.useState(false);
  const [hasAgreedToWaiver, setHasAgreedToWaiver] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
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
      const orgSlug = Array.isArray(params.organizationSlug)
        ? params.organizationSlug[0]
        : params.organizationSlug;

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
  }, [params.organizationSlug, form]);

  // Handle opening waiver dialog
  const handleOpenWaiverDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWaiverDialogOpen(true);
  };

  // Handle agreeing to waiver
  const handleAgreeToWaiver = () => {
    setHasAgreedToWaiver(true);
    form.setValue('waiverAgreement', true);
    setIsWaiverDialogOpen(false);
  };

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

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors);
    // Scroll to first error
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
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
      <>
        <div className="fixed inset-0 z-0">
          <Image
            src="/assets/team-member-signup/sportsfest-bad-link.webp"
            alt="Invalid Link"
            width="1920"
            height="1080"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm">
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
      </>
    );
  }

  // Show success message
  if (successMessage) {
    return (
      <>
        <div className="fixed inset-0 z-0">
          <Image
            src="/assets/team-member-signup/sportsfest-player-signup-success.webp"
            alt="Registration Successful"
            width="1920"
            height="1080"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm">
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
      </>
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
              className="flex flex-col items-center gap-8 space-y-8"
            >
              <div className="flex flex-row items-center justify-center gap-4 lg:gap-8 h-28">
                {organization.logo ? (
                  <>
                    <Logo isFull={true} variant="light" width={200} height={111} />
                    <Separator orientation="vertical" className="h-full opacity-60"  />
                    <Card className="py-4 px-2">
                      <img
                        src={organization.logo}
                        alt={`${organization.name} logo`}
                        className="max-h-[222px] w-auto object-contain"
                      />
                    </Card>
                  </>
                ) : (
                  <Logo isFull={true} variant="light" width={400} height={222} />
                )}
              </div>
              <SiteHeading
                badge="📩 You're Invited"
                title={`Join ${organization.name}${organization.activeEventYear ? ` ${organization.activeEventYear.name} Team` : ''}`}
                description="No Athletic Skill Necessary, Just Team Spirit and Company Pride!"
              />
            </motion.div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
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
                    <Controller
                      name="phone"
                      control={form.control}
                      render={({ field }) => (
                        <PatternFormat
                          id="phone"
                          format="(###) ###-####"
                          mask="_"
                          allowEmptyFormatting
                          customInput={Input}
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.value); // Store only raw digits
                          }}
                          className={form.formState.errors.phone ? 'border-destructive' : ''}
                        />
                      )}
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
                    <div className="flex items-center gap-2">
                      <Label>T-Shirt Size *</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              This information is for your team captain and company planning purposes only.
                              Please note that SportsFest will not be distributing t-shirts to players.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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
                  <Checkbox
                    id="waiverAgreement"
                    checked={hasAgreedToWaiver}
                    disabled
                    className="cursor-not-allowed"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="waiverAgreement"
                      className="text-sm font-medium leading-none"
                    >
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={handleOpenWaiverDialog}
                        className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                      >
                        waiver and release of liability
                      </button>{' '}
                      *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      You must read and agree to the waiver to complete registration.
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

      {/* Waiver Dialog */}
      <Dialog open={isWaiverDialogOpen} onOpenChange={setIsWaiverDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Waiver and Release of Liability</DialogTitle>
            <DialogDescription>
              Please read the waiver carefully before agreeing.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm">
            <p>
              Waiver RELEASE AND WAIVER OF LIABILITY AND INDEMNITY AGREEMENT MUST BE COMPLETED BY EVERY COMPETING MEMBER. Tampa Bay Corporate SportsFest IN CONSIDERATION of being permitted to participate in Tampa Bay Corporate SportsFest: I acknowledge that I must be 18 years of age to participate in the activities. I know the events and activities offered by Florida Corporate SportsFest, Inc. are potentially hazardous. I am in proper physical condition to participate and assume any and all risks associated with my participation, including, but not limited to falls, contact with other participants, the effect of the weather, including lightning, high heat and/or humidity, all such risks being known and appreciated by me. In consideration of this entry, I for myself and anyone entitled to act on my behalf, waive, release and discharge Florida Corporate SportsFest, Inc., any affiliated companies, sponsors and/or its agents, employees, all event officials, and any other sponsors, groups or individuals associated with SportsFest activity. I will not permit individuals to participate who are not on my roster or who are not officially registered with Corporate SportsFest. I will not bring alcohol to any of the sites. I grant the agents of this event permission to use photographs, videotapes or any other record of me in this event. THE UNDERSIGNED HAS READ AND VOLUNTARILY SIGNS THE RELEASE AND WAIVER OF LIABILITY AND INDEMNITY AGREEMENT, and further agrees that no oral representations, statements or inducements apart from the foregoing written agreement have been made.
            </p>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              onClick={handleAgreeToWaiver}
              className="w-full sm:w-auto"
            >
              I Agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default function TeamMemberSignupPage() {
  return (
    <React.Suspense fallback={
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full size-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <TeamMemberSignupForm />
    </React.Suspense>
  );
}
