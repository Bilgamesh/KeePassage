import { Decrypter, Encrypter } from 'age-encryption';
import {
  RETIRED_SLOTS,
  withYubiKeyClient,
} from '@/pcsc-daemon/lib/yubikey-client';
import { YubiKeyIdentity } from '@/pcsc-daemon/lib/yubikey-identity';
import { YubiKeyRecipient } from '@/pcsc-daemon/lib/yubikey-recipient';
import {
  DaemonMessage,
  type DaemonResponse,
} from '@/schemas/daemon-message-schema';
import { createLineReader } from '@/utils/listen-util';

process.title = `KeePassage PCSC Daemon`;

process.stdin.setEncoding('utf8');

process.stdin.on(
  'data',
  createLineReader((data) => {
    try {
      const messages = `${data}`.trim().split('\n');
      for (const msg of messages) {
        const payload = DaemonMessage.parse(JSON.parse(msg));
        switch (payload.command) {
          case 'DETECT_YUBIKEYS':
            detectYubiKeys(payload.id);
            break;
          case 'AGE_ENCRYPT':
            ageEncrypt(payload.id, payload.publicKey, payload.body);
            break;
          case 'AGE_DECRYPT':
            ageDecrypt(
              payload.id,
              payload.publicKey,
              payload.body,
              payload.pin,
              payload.slot,
            );
            break;
          default:
            break;
        }
      }
    } catch (_err) {
      send({
        status: 'GENERAL_ERROR',
        id: '',
        error: 'Failed to parse App Request',
      });
    }
  }),
);

function send(obj: DaemonResponse) {
  process.stdout.write(`${JSON.stringify(obj)}\n`);
}

function detectYubiKeys(requestId: string) {
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
              send({
                id: requestId,
                status: 'DETECT_YUBIKEYS_SUCCESS',
                serial: serial,
                slot: number,
                publicKey,
              });
            }
          } catch (err) {
            send({
              id: requestId,
              status: 'DETECT_YUBIKEYS_ERROR',
              error: `${err}`,
            });
          }
        }
      } catch (err) {
        send({
          id: requestId,
          status: 'DETECT_YUBIKEYS_ERROR',
          error: `${err}`,
        });
      }
    },
    (error) => {
      send({
        id: requestId,
        status: 'DETECT_YUBIKEYS_ERROR',
        error: `${error}`,
      });
    },
  );
}

async function ageEncrypt(
  requestId: string,
  publicKey: string,
  message: string,
) {
  try {
    const encrypter = new Encrypter();
    encrypter.addRecipient(
      new YubiKeyRecipient({
        publicKey,
      }),
    );
    const ciphertext = await encrypter.encrypt(message);
    const result = Buffer.from(ciphertext).toString('base64');
    send({
      id: requestId,
      status: 'AGE_ENCRYPT_SUCCESS',
      body: result,
    });
  } catch (err) {
    send({
      id: requestId,
      status: 'AGE_ENCRYPT_ERROR',
      error: `${err}`,
    });
  }
}

async function ageDecrypt(
  requestId: string,
  publicKey: string,
  encrypted: string,
  pin: number,
  slot: number,
) {
  const slotId = RETIRED_SLOTS.find((rs) => rs.number === slot)?.id;
  if (slotId === undefined) {
    send({
      id: requestId,
      status: 'AGE_DECRYPT_ERROR',
      error: `Invalid slot: ${slot}`,
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
          slot: slotId,
        }),
      );
      const ciphertext = new Uint8Array(Buffer.from(encrypted, 'base64'));
      const decrypted = await decrypter.decrypt(ciphertext, 'text');
      send({
        id: requestId,
        status: 'AGE_DECRYPT_SUCCESS',
        body: decrypted,
      });
    },
    (error) => {
      send({
        id: requestId,
        status: 'AGE_DECRYPT_ERROR',
        error: `${error}`,
      });
    },
  );
}
