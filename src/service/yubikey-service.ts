import { randomUUID } from 'node:crypto';
import { Decrypter, Encrypter } from 'age-encryption';
import { Payload } from '#/schemas/database-schema';
import type {
  DecryptionError,
  DecryptionSuccess,
  DetectionError,
  DetectionSuccess,
  EncryptionError,
  EncryptionSuccess,
  YubiKey
} from '#/schemas/yubikey-schema';
import { RETIRED_SLOTS, withYubiKeyClient } from '#/service/lib/yubikey-client';
import { YubiKeyIdentity } from '#/service/lib/yubikey-identity';
import { YubiKeyRecipient } from '#/service/lib/yubikey-recipient';
import { createListeners } from '#/utils/listen-util';

async function detectYubiKey(options?: {
  timeoutMs?: number | undefined;
  signal?: AbortSignal | undefined;
}) {
  const listeners = createListeners<DetectionSuccess | DetectionError>();

  detectYubiKeys(
    randomUUID(),
    listeners.notifyListeners,
    listeners.notifyListeners
  );

  const resp = await listeners.waitForValue(options);

  if (resp.status === 'DETECT_YUBIKEYS_ERROR')
    throw new Error('Failed to detect YubiKey', {
      cause: resp.error
    });

  return {
    publicKey: resp.publicKey,
    serial: resp.serial,
    slot: resp.slot
  };
}

function monitorYubiKeys(
  onYubiKey: (key: YubiKey) => void,
  options?: { immediate?: boolean; intervalMs?: number }
) {
  const listeners = createListeners<DetectionSuccess | DetectionError>();

  const callback = (resp: DetectionSuccess | DetectionError) => {
    if (resp.status === 'DETECT_YUBIKEYS_SUCCESS')
      onYubiKey({
        paired: false,
        publicKey: resp.publicKey,
        serial: resp.serial,
        slot: resp.slot
      });
  };

  listeners.addListener(callback);

  const detectionInterval = setInterval(() => {
    detectYubiKeys(
      randomUUID(),
      listeners.notifyListeners,
      listeners.notifyListeners
    );
  }, options?.intervalMs ?? 3000);

  const cleanup = () => {
    listeners.removeListener(callback);
    clearInterval(detectionInterval);
  };

  if (options?.immediate)
    detectYubiKeys(
      randomUUID(),
      listeners.notifyListeners,
      listeners.notifyListeners
    );

  return cleanup;
}

async function encrypt(
  payload: Payload,
  publicKey: string,
  options?: {
    timeoutMs?: number | undefined;
    signal?: AbortSignal | undefined;
  }
) {
  const listeners = createListeners<EncryptionSuccess | EncryptionError>();

  ageEncrypt(
    randomUUID(),
    publicKey,
    JSON.stringify(payload),
    listeners.notifyListeners,
    listeners.notifyListeners
  );

  const resp = await listeners.waitForValue(options);

  if (resp.status === 'AGE_ENCRYPT_ERROR')
    throw new Error('Failed to age encrypt', { cause: resp.error });

  return resp.body;
}

function detectYubiKeys(
  requestId: string,
  onSuccess: (resp: DetectionSuccess) => void,
  onError: (resp: DetectionError) => void
) {
  withYubiKeyClient(
    async (client) => {
      try {
        await client.selectYubicoOtp();
        const serial = await client.getSerialNumber();
        await client.selectPiv();
        for (const { number, objectId } of RETIRED_SLOTS) {
          try {
            const publicKey = await client.getPublicKey(objectId);
            if (publicKey) {
              onSuccess({
                id: requestId,
                status: 'DETECT_YUBIKEYS_SUCCESS',
                serial: serial,
                slot: number,
                publicKey
              });
            }
          } catch (err) {
            onError({
              id: requestId,
              status: 'DETECT_YUBIKEYS_ERROR',
              error: `${err}`
            });
          }
        }
      } catch (err) {
        onError({
          id: requestId,
          status: 'DETECT_YUBIKEYS_ERROR',
          error: `${err}`
        });
      }
    },
    (error) => {
      onError({
        id: requestId,
        status: 'DETECT_YUBIKEYS_ERROR',
        error: `${error}`
      });
    }
  );
}

async function ageEncrypt(
  requestId: string,
  publicKey: string,
  message: string,
  onSuccess: (resp: EncryptionSuccess) => void,
  onError: (resp: EncryptionError) => void
) {
  try {
    const encrypter = new Encrypter();
    encrypter.addRecipient(
      new YubiKeyRecipient({
        publicKey
      })
    );
    const ciphertext = await encrypter.encrypt(message);
    const result = Buffer.from(ciphertext).toString('base64');
    onSuccess({
      id: requestId,
      status: 'AGE_ENCRYPT_SUCCESS',
      body: result
    });
  } catch (err) {
    onError({
      id: requestId,
      status: 'AGE_ENCRYPT_ERROR',
      error: `${err}`
    });
  }
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
  const listeners = createListeners<DecryptionSuccess | DecryptionError>();

  ageDecrypt(
    randomUUID(),
    publicKey,
    encrypted,
    pin,
    slot,
    listeners.notifyListeners,
    listeners.notifyListeners
  );

  const resp = await listeners.waitForValue(options);
  if (resp.status === 'AGE_DECRYPT_ERROR')
    throw new Error('Failed to age decrypt', { cause: resp.error });

  return Payload.parse(JSON.parse(resp.body));
}

async function ageDecrypt(
  requestId: string,
  publicKey: string,
  encrypted: string,
  pin: number,
  slot: number,
  onSuccess: (resp: DecryptionSuccess) => void,
  onError: (resp: DecryptionError) => void
) {
  const slotId = RETIRED_SLOTS.find((rs) => rs.number === slot)?.id;
  if (slotId === undefined) {
    onError({
      id: requestId,
      status: 'AGE_DECRYPT_ERROR',
      error: `Invalid slot: ${slot}`
    });
    return;
  }
  withYubiKeyClient(
    async (client) => {
      await client.selectPiv();
      const decrypter = new Decrypter();
      decrypter.addIdentity(
        new YubiKeyIdentity({
          yubiKey: client,
          pin: `${pin}`,
          publicKey: publicKey,
          slot: slotId
        })
      );
      const ciphertext = new Uint8Array(Buffer.from(encrypted, 'base64'));
      const decrypted = await decrypter.decrypt(ciphertext, 'text');
      onSuccess({
        id: requestId,
        status: 'AGE_DECRYPT_SUCCESS',
        body: decrypted
      });
    },
    (error) => {
      onError({
        id: requestId,
        status: 'AGE_DECRYPT_ERROR',
        error: `${error}`
      });
    }
  );
}

export {
  detectYubiKey,
  detectYubiKeys,
  encrypt,
  ageEncrypt,
  ageDecrypt,
  decrypt,
  monitorYubiKeys
};
