import { chacha20poly1305 } from '@noble/ciphers/chacha';
import { p256 } from '@noble/curves/nist.js';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha2';
import { base64nopad, bech32 } from '@scure/base';
import type { Identity, Stanza } from 'age-encryption';
import type { YubiKeyClient } from '#/pcsc-daemon/lib/yubikey-client';

const ENCRYPTED_FILE_KEY_BYTES = 32;
const STANZA_TAG = 'piv-p256';
const STANZA_KEY_LABEL = new TextEncoder().encode(STANZA_TAG);
const NONCE_LENGTH = 12;

class YubiKeyIdentity implements Identity {
  private pin: string;
  private publicKey: string;
  private slot: number;
  private yubiKey: YubiKeyClient;

  constructor(config: {
    yubiKey: YubiKeyClient;
    pin: string;
    publicKey: string;
    slot: number;
  }) {
    this.yubiKey = config.yubiKey;
    this.pin = config.pin;
    this.publicKey = config.publicKey;
    this.slot = config.slot;
  }

  private parseTlv(buf: Uint8Array) {
    let offset = 0;
    const tag = buf[offset++];
    let len = buf[offset++]!;

    if (len & 0x80) {
      const n = len & 0x7f;
      len = 0;
      for (let i = 0; i < n; i++) {
        len = (len << 8) | buf[offset++]!;
      }
    }

    return { tag, len, value: buf.slice(offset, offset + len) };
  }

  async unwrapFileKey(stanzas: Stanza[]): Promise<Uint8Array | null> {
    if (stanzas.length === 0) {
      return null;
    }
    const stanza = stanzas[0];
    if (stanza === undefined) {
      throw new Error('Missing stanza');
    }
    const epkBytes = base64nopad.decode(stanza.args[2]!);

    await this.yubiKey.selectPiv();

    await this.yubiKey.verifyPin(this.pin);

    const point = p256.Point.fromHex(epkBytes);
    const uncompressed = point.toBytes(false);

    const resp = await this.yubiKey.p256ecdh(uncompressed, this.slot);

    const sw = (resp[resp.length - 2]! << 8) | resp[resp.length - 1]!;

    if (sw !== 0x9000) {
      throw new Error(`YubiKey returned SW=0x${sw.toString(16)}`);
    }

    const apduData = resp.slice(0, resp.length - 2);
    const outer = this.parseTlv(apduData);
    if (outer.tag !== 0x7c) {
      throw new Error('Invalid outer TLV');
    }

    const inner = this.parseTlv(outer.value);
    const sharedSecret = inner.value;

    if (inner.tag !== 0x82 && inner.tag !== 0x85) {
      throw new Error('Invalid inner TLV');
    }

    const ephemeralPublic = base64nopad.decode(stanza.args[2]!);
    const recipientPublic = bech32.decodeToBytes(this.publicKey).bytes;
    const salt = new Uint8Array(
      ephemeralPublic.length + recipientPublic.length
    );
    salt.set(ephemeralPublic);
    salt.set(recipientPublic, ephemeralPublic.length);
    const key = hkdf(
      sha256,
      sharedSecret,
      salt,
      STANZA_KEY_LABEL,
      ENCRYPTED_FILE_KEY_BYTES
    );

    const nonce = new Uint8Array(NONCE_LENGTH);

    return chacha20poly1305(key, nonce).decrypt(stanza.body);
  }
}

export { YubiKeyIdentity };
