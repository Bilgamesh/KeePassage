import { z } from 'zod';

const YubiKey = z.object({
  serial: z.number(),
  slot: z.number(),
  publicKey: z.string(),
  paired: z.boolean(),
});
type YubiKey = z.infer<typeof YubiKey>;

export { YubiKey };
