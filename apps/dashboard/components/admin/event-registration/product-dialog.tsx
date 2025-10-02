'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import NiceModal from '@ebay/nice-modal-react';
import { Loader2Icon, PackageIcon, TrashIcon, UploadIcon } from 'lucide-react';
import { NumericFormat } from 'react-number-format';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Switch } from '@workspace/ui/components/switch';
import { Textarea } from '@workspace/ui/components/textarea';
import { ImageDropzone } from '@workspace/ui/components/image-dropzone';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@workspace/ui/components/tooltip';
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

import { ProductType, ProductStatus } from '@workspace/database/schema';
import type { ProductFormData } from '~/actions/admin/product';
import type { ProductFormSelectData } from '~/actions/admin/get-product-form-data';
import { updateProductImage } from '~/actions/admin/update-product-image';
import { CropPhotoModal } from '~/components/organizations/slug/settings/account/profile/crop-photo-modal';
import { FileUploadAction, MAX_IMAGE_SIZE } from '~/lib/file-upload';

const productFormSchema = z.object({
  categoryId: z.string().uuid('Category is required'),
  eventYearId: z.string().uuid('Event year is required'),
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().optional(),
  image: z.string().optional(),
  type: z.nativeEnum(ProductType, {
    required_error: 'Product type is required',
  }),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  basePrice: z.number().min(0, 'Price must be 0 or greater'),
  requiresDeposit: z.boolean().default(false),
  depositAmount: z.number().min(0, 'Deposit amount must be 0 or greater').optional(),
  maxQuantityPerOrg: z.number().int().min(1).optional(),
  totalInventory: z.number().int().min(0).optional(),
  displayOrder: z.number().int().min(0, 'Display order must be 0 or greater').default(0),
}).refine((data) => {
  if (data.requiresDeposit && (!data.depositAmount || data.depositAmount <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Deposit amount is required when deposit is required',
  path: ['depositAmount'],
}).refine((data) => {
  if (data.depositAmount && data.depositAmount >= data.basePrice) {
    return false;
  }
  return true;
}, {
  message: 'Deposit amount must be less than base price',
  path: ['depositAmount'],
});

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductFormData & { id?: string };
  mode?: 'create' | 'edit';
  formData: ProductFormSelectData;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  mode = 'create',
  formData
}: ProductDialogProps): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      categoryId: '',
      eventYearId: '',
      name: '',
      description: '',
      image: '',
      type: ProductType.TEAM_REGISTRATION,
      status: ProductStatus.ACTIVE,
      basePrice: 0,
      requiresDeposit: false,
      depositAmount: undefined,
      maxQuantityPerOrg: undefined,
      totalInventory: undefined,
      displayOrder: 0,
    },
  });

  const watchRequiresDeposit = form.watch('requiresDeposit');
  const watchImage = form.watch('image');

  const handleImageDrop = async (files: File[]): Promise<void> => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(
          `Uploaded image shouldn't exceed ${MAX_IMAGE_SIZE / 1000000} MB size limit`
        );
      } else {
        const base64Image: string = await NiceModal.show(CropPhotoModal, {
          file,
          aspectRatio: 16 / 9, // Product images typically wider aspect ratio
          circularCrop: false
        });
        if (base64Image) {
          form.setValue('image', base64Image, {
            shouldValidate: true,
            shouldDirty: true
          });
        }
      }
    }
  };

  const handleRemoveImage = (): void => {
    form.setValue('image', '', {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  React.useEffect(() => {
    if (open) {
      if (product) {
        form.reset(product);
      } else {
        form.reset({
          categoryId: '',
          eventYearId: '',
          name: '',
          description: '',
          image: '',
          type: ProductType.TEAM_REGISTRATION,
          status: ProductStatus.ACTIVE,
          basePrice: 0,
          requiresDeposit: false,
          depositAmount: undefined,
          maxQuantityPerOrg: undefined,
          totalInventory: undefined,
          displayOrder: 0,
        });
      }
    }
  }, [product, form, open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset({
        categoryId: '',
        eventYearId: '',
        name: '',
        description: '',
        image: '',
        type: ProductType.TEAM_REGISTRATION,
        status: ProductStatus.ACTIVE,
        basePrice: 0,
        requiresDeposit: false,
        depositAmount: undefined,
        maxQuantityPerOrg: undefined,
        totalInventory: undefined,
        displayOrder: 0,
      });
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      const { image, ...productData } = data;
      let productId = product?.id;

      // Create or update the product first
      if (mode === 'create') {
        const { createProduct } = await import('~/actions/admin/product');
        const result = await createProduct(productData);
        productId = result.product.id;
      } else if (productId) {
        const { updateProduct } = await import('~/actions/admin/product');
        await updateProduct(productId, productData);
      } else {
        throw new Error('No product ID provided for update');
      }

      // Handle image upload/update separately if there's an image change
      if (productId && image !== product?.image) {
        if (image) {
          // Upload new image
          await updateProductImage(productId, {
            action: FileUploadAction.Update,
            image
          });
        } else if (product?.image) {
          // Remove existing image
          await updateProductImage(productId, {
            action: FileUploadAction.Delete
          });
        }
      }

      toast.success(`Product ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      handleOpenChange(false);
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} product:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} product. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            {mode === 'create' ? 'Create Product' : 'Edit Product'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new product to the event registration catalog'
              : 'Update the product information and pricing details'
            }
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="pt-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    Product Information
                  </h4>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="SportsFest Team Registration" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the product..."
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel>Product Image</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          {watchImage ? (
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-16 w-16 rounded-lg">
                                <AvatarImage
                                  src={watchImage}
                                  alt="Product image"
                                  className="rounded-lg object-cover"
                                />
                                <AvatarFallback className="rounded-lg">
                                  <PackageIcon className="h-6 w-6" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm text-muted-foreground">
                                  Product image uploaded
                                </p>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={handleRemoveImage}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                    <span className="sr-only">Remove image</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remove image</TooltipContent>
                              </Tooltip>
                            </div>
                          ) : (
                            <ImageDropzone
                              onDrop={handleImageDrop}
                              accept={{
                                'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
                              }}
                              maxFiles={1}
                              className="h-32"
                            >
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <UploadIcon className="h-8 w-8 text-muted-foreground" />
                                <div className="text-center">
                                  <p className="text-sm font-medium">
                                    Drop an image here or click to browse
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG, GIF, WEBP up to {MAX_IMAGE_SIZE / 1000000}MB
                                  </p>
                                </div>
                              </div>
                            </ImageDropzone>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="eventYearId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Year</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {formData.eventYears.map((eventYear) => (
                              <SelectItem key={eventYear.id} value={eventYear.id}>
                                {eventYear.year} - {eventYear.name}
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
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {formData.categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(ProductType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(ProductStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-4">
                <div className="pt-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    Pricing & Inventory
                  </h4>
                </div>

                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        <NumericFormat
                          customInput={Input}
                          thousandSeparator
                          prefix="$"
                          decimalScale={2}
                          fixedDecimalScale
                          allowNegative={false}
                          placeholder="$0.00"
                          value={field.value}
                          onValueChange={(values) => field.onChange(values.floatValue || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiresDeposit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Offer Deposit Option</FormLabel>
                        <FormDescription>
                          Allow customers to choose between deposit or full payment
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

                {watchRequiresDeposit && (
                  <FormField
                    control={form.control}
                    name="depositAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deposit Amount</FormLabel>
                        <FormControl>
                          <NumericFormat
                            customInput={Input}
                            thousandSeparator
                            prefix="$"
                            decimalScale={2}
                            fixedDecimalScale
                            allowNegative={false}
                            placeholder="$0.00"
                            value={field.value || ''}
                            onValueChange={(values) => field.onChange(values.floatValue || undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Must be less than base price. Customers can choose deposit or full payment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="maxQuantityPerOrg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Quantity / Organization</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Leave blank for unlimited"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalInventory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Inventory</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Leave blank for unlimited"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          value={field.value || 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first in the customer-facing product list
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </FormProvider>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create' : 'Update'} Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
