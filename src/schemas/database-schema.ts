import { z } from 'zod';

import { YubiKey } from '@/schemas/yubikey-schema';

const Payload = z.object({
  password: z.string()
});
type Payload = z.infer<typeof Payload>;

type Entry = {
  title: string;
  username: string;
  encryptedPayloads: string[];
  url: string;
  tags: string;
  notes: string;
  modified: number;
};

type DbIndex = {
  version: number;
  name: string;
  description: string;
  keys: YubiKey[];
  secrets: Entry[];
};

const DbFile = z.object({
  i: z.string(),
  k: z.array(z.string()),
  s: z.array(
    z.object({
      serial: z.number(),
      slot: z.number(),
      publicKey: z.string()
    })
  )
});
type DbFile = z.infer<typeof DbFile>;

export { DbFile, Payload, type DbIndex, type Entry };
