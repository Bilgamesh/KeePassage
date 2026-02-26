import { z } from 'zod';

const DaemonMessage = z.discriminatedUnion('command', [
  z.object({
    id: z.string(),
    command: z.literal('DETECT_YUBIKEYS'),
  }),
  z.object({
    id: z.string(),
    command: z.literal('AGE_ENCRYPT'),
    body: z.string(),
    publicKey: z.string(),
  }),
  z.object({
    id: z.string(),
    command: z.literal('AGE_DECRYPT'),
    publicKey: z.string(),
    slot: z.number(),
    pin: z.number(),
    body: z.string(),
  }),
  z.object({
    id: z.string(),
    command: z.literal('ABORT'),
  }),
]);
type DaemonMessage = z.infer<typeof DaemonMessage>;

const DaemonResponse = z.discriminatedUnion('status', [
  z.object({
    id: z.string(),
    status: z.literal('DETECT_YUBIKEYS_SUCCESS'),
    serial: z.number(),
    slot: z.number(),
    publicKey: z.string(),
  }),
  z.object({
    id: z.string(),
    status: z.literal('AGE_ENCRYPT_SUCCESS'),
    body: z.string(),
  }),
  z.object({
    id: z.string(),
    status: z.literal('AGE_DECRYPT_SUCCESS'),
    body: z.string(),
  }),
  z.object({
    id: z.string(),
    status: z.literal('DETECT_YUBIKEYS_ERROR'),
    error: z.string(),
  }),
  z.object({
    id: z.string(),
    status: z.literal('AGE_ENCRYPT_ERROR'),
    error: z.string(),
  }),
  z.object({
    id: z.string(),
    status: z.literal('AGE_DECRYPT_ERROR'),
    error: z.string(),
  }),
  z.object({
    id: z.literal(''),
    status: z.literal('GENERAL_ERROR'),
    error: z.string(),
  }),
]);

type DaemonResponse = z.infer<typeof DaemonResponse>;
type DetectionDaemonResponse = Extract<
  DaemonResponse,
  { status: 'DETECT_YUBIKEYS_SUCCESS' | 'DETECT_YUBIKEYS_ERROR' }
>;
type EncryptionDaemonResponse = Extract<
  DaemonResponse,
  { status: 'AGE_ENCRYPT_SUCCESS' | 'AGE_ENCRYPT_ERROR' }
>;
type DecryptionDaemonResponse = Extract<
  DaemonResponse,
  { status: 'AGE_DECRYPT_SUCCESS' | 'AGE_DECRYPT_ERROR' }
>;

export {
  DaemonMessage,
  DaemonResponse,
  type DecryptionDaemonResponse,
  type DetectionDaemonResponse,
  type EncryptionDaemonResponse,
};
