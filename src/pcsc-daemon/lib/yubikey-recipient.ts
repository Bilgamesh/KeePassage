import { chacha20poly1305 } from '@noble/ciphers/chacha';
import type { WeierstrassPoint } from '@noble/curves/abstract/weierstrass';
import { p256 } from '@noble/curves/nist.js';
import { numberToBytesBE } from '@noble/curves/utils';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha2';
import { base64nopad, bech32 } from '@scure/base';
import { type Recipient, Stanza } from 'age-encryption';

const TAG_BYTES = 4;
const EPK_BYTES = 33;
const FILE_KEY_BYTES = 16;
const ENCRYPTED_FILE_KEY_BYTES = 32;
const NONCE_LENGTH = 12;
const RECIPIENT_PREFIX = 'age1yubikey1';
const STANZA_TAG = 'piv-p256';
const STANZA_KEY_LABEL = new TextEncoder().encode(STANZA_TAG);

function validatePublicKey(bytes: Uint8Array): WeierstrassPoint<bigint> | null {
  try {
    if (
      bytes.length !== EPK_BYTES ||
      (bytes[0] !== 0x02 && bytes[0] !== 0x03)
    ) {
      return null;
    }

    const point = p256.Point.fromHex(Buffer.from(bytes).toString('hex'));

    return point;
  } catch {
    return null;
  }
}

class YubiKeyRecipient implements Recipient {
  private publicKey: Uint8Array;
  private serial: string | undefined;
  private tag: Uint8Array;
  private point: WeierstrassPoint<bigint>;

  constructor(config: { publicKey: string }) {
    const res = bech32.decodeToBytes(config.publicKey);
    if (
      !config.publicKey.startsWith(RECIPIENT_PREFIX) ||
      res.prefix.toLowerCase() !== 'age1yubikey'
    ) {
      throw Error('invalid yubiKey recipient');
    }

    this.publicKey = res.bytes;

    const point = validatePublicKey(this.publicKey);
    if (!point) {
      throw Error('invalid yubiKey recipient point');
    }

    this.point = point;

    this.tag = sha256(this.publicKey).slice(0, TAG_BYTES);
  }

  async wrapFileKey(fileKey: Uint8Array): Promise<Stanza[]> {
    if (fileKey.length !== FILE_KEY_BYTES) {
      throw new Error(`invalid file key length: ${fileKey.length}`);
    }

    const ephemeralPrivate = p256.utils.randomSecretKey();
    const ephemeralPublic = p256.getPublicKey(ephemeralPrivate, true);

    if (!validatePublicKey(ephemeralPublic)) {
      throw new Error('invalid ephemeral key');
    }

    const ephemeralScalar = p256.Point.Fn.fromBytes(ephemeralPrivate);
    const sharedPoint = this.point.multiply(ephemeralScalar);

    const sharedX = sharedPoint.toAffine().x;
    const sharedSecret = numberToBytesBE(sharedX, ENCRYPTED_FILE_KEY_BYTES);

    const salt = new Uint8Array(ephemeralPublic.length + this.publicKey.length);
    salt.set(ephemeralPublic);
    salt.set(this.publicKey, ephemeralPublic.length);

    const key = hkdf(
      sha256,
      sharedSecret,
      salt,
      STANZA_KEY_LABEL,
      ENCRYPTED_FILE_KEY_BYTES,
    );

    const stanzaArgs = [
      STANZA_TAG,
      base64nopad.encode(this.tag),
      base64nopad.encode(ephemeralPublic),
    ];

    if (this.serial) {
      stanzaArgs.splice(2, 0, this.serial);
    }

    const nonce = new Uint8Array(NONCE_LENGTH);
    const encryptedKey = chacha20poly1305(key, nonce).encrypt(fileKey);

    return [new Stanza(stanzaArgs, encryptedKey)];
  }
}

export { YubiKeyRecipient };
