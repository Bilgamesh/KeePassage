import { randomUUID } from 'node:crypto';
import { sendAndWait } from '@/data/pcsc-orchestrator';
import type {
  DecryptionDaemonResponse,
  DetectionDaemonResponse,
  EncryptionDaemonResponse
} from '@/schemas/daemon-message-schema';
import { Payload } from '@/schemas/database-schema';

async function detectYubiKey(options?: {
  timeoutMs?: number | undefined;
  signal?: AbortSignal | undefined;
}) {
  const resp = (await sendAndWait(
    {
      id: randomUUID(),
      command: 'DETECT_YUBIKEYS'
    },
    { timeoutMs: options?.timeoutMs, signal: options?.signal }
  )) as DetectionDaemonResponse;
  if (resp.status !== 'DETECT_YUBIKEYS_SUCCESS') {
    throw new Error('Failed to detect YubiKey', {
      cause: resp.error
    });
  }
  return {
    publicKey: resp.publicKey,
    serial: resp.serial,
    slot: resp.slot
  };
}

async function encrypt(
  payload: Payload,
  publicKey: string,
  options?: {
    timeoutMs?: number | undefined;
    signal?: AbortSignal | undefined;
  }
) {
  const resp = (await sendAndWait(
    {
      id: randomUUID(),
      command: 'AGE_ENCRYPT',
      body: JSON.stringify(payload),
      publicKey: publicKey
    },
    { timeoutMs: options?.timeoutMs, signal: options?.signal }
  )) as EncryptionDaemonResponse;
  if (resp.status !== 'AGE_ENCRYPT_SUCCESS') {
    throw new Error('Failed to age encrypt', { cause: resp.error });
  }
  return resp.body;
}

async function decrypt(
  encrypted: string,
  pin: number,
  publicKey: string,
  slot: number,
  options?: {
    timeoutMs?: number | undefined;
    signal?: AbortSignal | undefined;
  }
) {
  const resp = (await sendAndWait(
    {
      id: randomUUID(),
      command: 'AGE_DECRYPT',
      pin,
      publicKey: publicKey,
      body: encrypted,
      slot: slot
    },
    { timeoutMs: options?.timeoutMs, signal: options?.signal }
  )) as DecryptionDaemonResponse;
  if (resp.status !== 'AGE_DECRYPT_SUCCESS') {
    throw new Error('Failed to age decrypt', { cause: resp.error });
  }
  return Payload.parse(JSON.parse(resp.body));
}

export { decrypt, detectYubiKey, encrypt };
