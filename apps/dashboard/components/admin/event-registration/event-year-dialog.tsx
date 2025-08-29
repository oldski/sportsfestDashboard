'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { CalendarIcon, Loader2Icon, MapPinIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Switch } from '@workspace/ui/components/switch';
import { Calendar } from '@workspace/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import {
  FormProvider,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { toast } from '@workspace/ui/components/sonner';
import { cn } from '@workspace/ui/lib/utils';

import { US_STATES } from '~/lib/constants';
import type { EventYearFormData } from '~/actions/admin/event-year';

interface EventYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventYear?: EventYearFormData & { id?: string };
  mode?: 'create' | 'edit';
}

export function EventYearDialog({ 
  open, 
  onOpenChange, 
  eventYear, 
  mode = 'create' 
}: EventYearDialogProps): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<EventYearFormData>({
    defaultValues: eventYear || {
      year: new Date().getFullYear() + 1,
      name: '',
      eventStartDate: undefined,
      eventEndDate: undefined,
      registrationOpen: undefined,
      registrationClose: undefined,
      locationName: '',
      address: '',
      city: '',
      state: 'FL',
      zipCode: '',
      latitude: undefined,
      longitude: undefined,
      isActive: false,
    },
  });

  // Reset form when eventYear prop changes or dialog opens/closes
  React.useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      if (eventYear) {
        form.reset(eventYear);
      } else {
        form.reset({
          year: new Date().getFullYear() + 1,
          name: '',
          locationName: '',
          address: '',
          city: '',
          state: 'FL',
          zipCode: '',
          latitude: undefined,
          longitude: undefined,
          isActive: false,
        });
      }
    }
  }, [eventYear, form, open]);

  // Clear form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Clear form when closing
      form.reset({
        year: new Date().getFullYear() + 1,
        name: '',
        locationName: '',
        address: '',
        city: '',
        state: 'FL',
        zipCode: '',
        latitude: undefined,
        longitude: undefined,
        isActive: false,
      });
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (data: EventYearFormData) => {
    setIsLoading(true);
    try {
      if (mode === 'create') {
        const { createEventYear } = await import('~/actions/admin/event-year');
        await createEventYear(data);
      } else if (eventYear?.id) {
        const { updateEventYear } = await import('~/actions/admin/event-year');
        await updateEventYear(eventYear.id, data);
      }
      
      toast.success(`Event year ${data.year} ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      handleOpenChange(false);
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} event year:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} event year. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5" />
            {mode === 'create' ? 'Create Event Year' : 'Edit Event Year'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Set up a new SportsFest event year with dates and location'
              : 'Update the event year information and location details'
            }
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Event Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2023"
                        max="2030"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="SportsFest 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Event Dates */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="eventStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              field.value.toLocaleDateString()
                            ) : (
                              <span>Pick start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              field.value.toLocaleDateString()
                            ) : (
                              <span>Pick end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Registration Dates */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="registrationOpen"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Registration Opens</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              field.value.toLocaleDateString()
                            ) : (
                              <span>Pick open date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationClose"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Registration Closes</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              field.value.toLocaleDateString()
                            ) : (
                              <span>Pick close date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Event Location
                </h4>
              </div>
              
              <FormField
                control={form.control}
                name="locationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Name</FormLabel>
                    <FormControl>
                      <Input placeholder="St. Pete Beach Resort & Conference Center" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="5250 Gulf Blvd" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="St. Pete Beach" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="33706" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="27.7211"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        For GPS navigation and directions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="-82.7411"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        For GPS navigation and directions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Active Toggle */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Set as Active Event Year
                    </FormLabel>
                    <FormDescription>
                      Make this the current active event year for registrations
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </FormProvider>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create' : 'Update'} Event Year
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}