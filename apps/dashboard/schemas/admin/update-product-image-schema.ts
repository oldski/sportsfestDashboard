import { z } from 'zod';

import { FileUploadAction } from '~/lib/file-upload';

export const updateProductImageSchema = z.object({
  action: z.nativeEnum(FileUploadAction),
  image: z
    .string({
      invalid_type_error: 'Image must be a string.'
    })
    .optional()
    .or(z.literal(''))
});

export type UpdateProductImageSchema = z.infer<
  typeof updateProductImageSchema
>;