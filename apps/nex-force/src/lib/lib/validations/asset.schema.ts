/**
 * Asset form validation — replaces Angular's FormGroup + Validators.
 *
 * Conversion:
 *   Validators.required → z.string().min(1)
 *   Validators.pattern(/^\d+$/) → z.string().regex(/^\d+$/)
 */
import { z } from "zod";

export const assetFormSchema = z.object({
    assetId: z.coerce.number().default(0),
    assetName: z.string().min(1, "Asset Name is required"),
    assetCode: z.string().min(1, "Asset Code is required"),
    type: z.string().min(1, "Type is required"),
    brand: z.string().min(1, "Brand is required"),
    warrantyStart: z.string().min(1, "Warranty Start is required"),
    warrantyEnd: z.string().min(1, "Warranty End is required"),
    warranty: z.string().regex(/^\d+$/, "Warranty must be a number (months)"),
    cost: z.string().regex(/^\d+$/, "Cost must be a number"),
    assetUser: z.string().min(1, "Asset User is required"),
    assetStatus: z.string().min(1, "Status is required"),
    vendor: z.string().default(""),
    assetModel: z.string().default(""),
    serialNumber: z.string().min(1, "Serial Number is required"),
    location: z.string().default(""),
    condition: z.string().default(""),
    description: z.string().default(""),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;
