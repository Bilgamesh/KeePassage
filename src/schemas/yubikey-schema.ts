import { z } from 'zod';

const YubiKey = z.object({
  serial: z.number(),
  slot: z.number(),
  publicKey: z.string(),
  paired: z.boolean()
});
type YubiKey = z.infer<typeof YubiKey>;

const YubiKeyResponse = z.discriminatedUnion('status', [
  z.object({
    id: z.string(),
    status: z.literal('DETECT_YUBIKEYS_SUCCESS'),
    serial: z.number(),
    slot: z.number(),
    publicKey: z.string()
  }),
  z.object({
    id: z.string(),
    status: z.literal('AGE_ENCRYPT_SUCCESS'),
    body: z.string()
  }),
  z.object({
    id: z.string(),
    status: z.literal('AGE_DECRYPT_SUCCESS'),
    body: z.string()
  }),
  z.object({
    id: z.string(),
    status: z.literal('DETECT_YUBIKEYS_ERROR'),
    error: z.any()
  }),
  z.object({
    id: z.string(),
    status: z.literal('AGE_ENCRYPT_ERROR'),
    error: z.any()
  }),
  z.object({
    id: z.string(),
    status: z.literal('AGE_DECRYPT_ERROR'),
    error: z.any()
  }),
  z.object({
    id: z.literal(''),
    status: z.literal('GENERAL_ERROR'),
    error: z.any()
  })
]);

type YubiKeyResponse = z.infer<typeof YubiKeyResponse>;
type DetectionSuccess = Extract<
  YubiKeyResponse,
  { status: 'DETECT_YUBIKEYS_SUCCESS' }
>;
type DetectionError = Extract<
  YubiKeyResponse,
  { status: 'DETECT_YUBIKEYS_ERROR' }
>;
type EncryptionSuccess = Extract<
  YubiKeyResponse,
  { status: 'AGE_ENCRYPT_SUCCESS' }
>;
type EncryptionError = Extract<
  YubiKeyResponse,
  { status: 'AGE_ENCRYPT_ERROR' }
>;
type DecryptionSuccess = Extract<
  YubiKeyResponse,
  { status: 'AGE_DECRYPT_SUCCESS' }
>;
type DecryptionError = Extract<
  YubiKeyResponse,
  { status: 'AGE_DECRYPT_ERROR' }
>;

export {
  type DecryptionError,
  type DecryptionSuccess,
  type DetectionError,
  type DetectionSuccess,
  type EncryptionError,
  type EncryptionSuccess,
  YubiKey,
  YubiKeyResponse
};
