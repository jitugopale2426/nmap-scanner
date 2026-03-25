import { z } from 'zod';

const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/(\d|[1-2]\d|3[0-2])$/;
const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;

export const startScanSchema = z.object({
  target: z
    .string({ required_error: 'Target is required' })
    .min(1, 'Target cannot be empty')
    .max(100, 'Target is too long')
    .refine(
      val => ipRegex.test(val) || cidrRegex.test(val) || hostnameRegex.test(val),
      { message: 'Target must be a valid IP address, CIDR range, or hostname' }
    )
});
