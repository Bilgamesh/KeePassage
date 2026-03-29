import { bech32 } from '@scure/base';
import {
  type Card,
  CardDisposition,
  CardMode,
  Client,
  type Err,
  ReaderStatus
} from 'pcsc-mini';

const APDU_KEYS = {
  CLASS_BYTE: { STANDARD_COMMAND: 0x00 },
  INSTRUCTION: {
    GET_SERIAL: 0x01,
    SELECT: 0xa4,
    PIN: 0x20,
    GENERAL_AUTHENTICATE: 0x87,
    GET_DATA: 0xcb,
    GET_RESPONSE: 0xc0
  },
  P1: {
    BY_AID: 0x04,
    BY_FID: 0x00,
    SERIAL: 0x10,
    P256ECDH: 0x11,
    PUBLIC_KEY: 0x3f
  },
  P2: {
    FIRST: 0x00,
    PIN_SLOT: 0x80,
    PUBLIC_KEY: 0xff
  }
} as const;

const SW_CODES = {
  OK: 0x9000,
  MORE_DATA: 0x61
} as const;

const KEY_PREFIX = 'age1yubikey';

const RETIRED_SLOTS = [
  { index: 0, number: 1, objectId: 0x005fc10d, id: 0x82, name: 'R1' },
  { index: 1, number: 2, objectId: 0x005fc10e, id: 0x83, name: 'R2' },
  { index: 2, number: 3, objectId: 0x005fc10f, id: 0x84, name: 'R3' },
  { index: 3, number: 4, objectId: 0x005fc110, id: 0x85, name: 'R4' },
  { index: 4, number: 5, objectId: 0x005fc111, id: 0x86, name: 'R5' },
  { index: 5, number: 6, objectId: 0x005fc112, id: 0x87, name: 'R6' },
  { index: 6, number: 7, objectId: 0x005fc113, id: 0x88, name: 'R7' },
  { index: 7, number: 8, objectId: 0x005fc114, id: 0x89, name: 'R8' },
  { index: 8, number: 9, objectId: 0x005fc115, id: 0x8a, name: 'R9' },
  { index: 9, number: 10, objectId: 0x005fc116, id: 0x8b, name: 'R10' },
  { index: 10, number: 11, objectId: 0x005fc117, id: 0x8c, name: 'R11' },
  { index: 11, number: 12, objectId: 0x005fc118, id: 0x8d, name: 'R12' },
  { index: 12, number: 13, objectId: 0x005fc119, id: 0x8e, name: 'R13' },
  { index: 13, number: 14, objectId: 0x005fc11a, id: 0x8f, name: 'R14' },
  { index: 14, number: 15, objectId: 0x005fc11b, id: 0x90, name: 'R15' },
  { index: 15, number: 16, objectId: 0x005fc11c, id: 0x91, name: 'R16' },
  { index: 16, number: 17, objectId: 0x005fc11d, id: 0x92, name: 'R17' },
  { index: 17, number: 18, objectId: 0x005fc11e, id: 0x93, name: 'R18' },
  { index: 18, number: 19, objectId: 0x005fc11f, id: 0x94, name: 'R19' },
  { index: 19, number: 20, objectId: 0x005fc120, id: 0x95, name: 'R20' }
] as const;

class YubiKeyClient {
  private card: Card;

  constructor(card: Card) {
    this.card = card;
  }

  private async transmit(
    header: { CLA: number; INS: number; P1: number; P2: number },
    payload?: number[]
  ) {
    const resp = await this.card.transmit(
      payload
        ? new Uint8Array([
            header.CLA,
            header.INS,
            header.P1,
            header.P2,
            payload.length,
            ...payload
          ])
        : new Uint8Array([header.CLA, header.INS, header.P1, header.P2])
    );
    const sw = (resp[resp.length - 2]! << 8) | resp[resp.length - 1]!;
    return { sw, resp };
  }

  async selectYubicoOtp() {
    const { sw } = await this.transmit(
      {
        CLA: APDU_KEYS.CLASS_BYTE.STANDARD_COMMAND,
        INS: APDU_KEYS.INSTRUCTION.SELECT,
        P1: APDU_KEYS.P1.BY_AID,
        P2: APDU_KEYS.P2.FIRST
      },
      [0xa0, 0x00, 0x00, 0x05, 0x27, 0x20, 0x01]
    );
    if (sw !== SW_CODES.OK) {
      throw new Error(`Select OTP failed: SW=${sw.toString(16)}`);
    }
  }

  async getSerialNumber() {
    const { sw, resp } = await this.transmit({
      CLA: APDU_KEYS.CLASS_BYTE.STANDARD_COMMAND,
      INS: APDU_KEYS.INSTRUCTION.GET_SERIAL,
      P1: APDU_KEYS.P1.SERIAL,
      P2: APDU_KEYS.P2.FIRST
    });
    if (sw !== SW_CODES.OK) {
      throw new Error(`Get serial number failed: SW=${sw.toString(16)}`);
    }
    const serial =
      (resp[0]! << 24) | (resp[1]! << 16) | (resp[2]! << 8) | resp[3]!;
    return serial >>> 0;
  }

  async selectPiv() {
    const { sw } = await this.transmit(
      {
        CLA: APDU_KEYS.CLASS_BYTE.STANDARD_COMMAND,
        INS: APDU_KEYS.INSTRUCTION.SELECT,
        P1: APDU_KEYS.P1.BY_AID,
        P2: APDU_KEYS.P2.FIRST
      },
      [0xa0, 0x00, 0x00, 0x03, 0x08]
    );
    if (sw !== SW_CODES.OK) {
      throw new Error(`Select PIV failed: SW=${sw.toString(16)}`);
    }
  }

  private encodeLength(len: number): number[] {
    if (len < 0x80) {
      return [len];
    } else if (len <= 0xff) {
      return [0x81, len];
    } else {
      return [0x82, (len >> 8) & 0xff, len & 0xff];
    }
  }

  async verifyPin(pin: string) {
    const pinBytes = new TextEncoder().encode(pin);
    const { sw } = await this.transmit(
      {
        CLA: APDU_KEYS.CLASS_BYTE.STANDARD_COMMAND,
        INS: APDU_KEYS.INSTRUCTION.PIN,
        P1: APDU_KEYS.P1.BY_FID,
        P2: APDU_KEYS.P2.PIN_SLOT
      },
      Array.from(pinBytes)
    );
    if (sw !== SW_CODES.OK) {
      throw new Error(`Verify PIN failed: SW=${sw.toString(16)}`);
    }
  }

  async p256ecdh(epkBytes: Uint8Array, slot: number) {
    if (epkBytes.length !== 65) {
      throw new Error('Invalid EPK length for P-256 (expected 65 bytes)');
    }

    const tlv82 = [0x82, 0x00];
    const len85 = this.encodeLength(epkBytes.length);
    const tlv85 = [0x85, ...len85, ...epkBytes];
    const innerValue = [...tlv82, ...tlv85];
    const len7c = this.encodeLength(innerValue.length);
    const tlv7c = [0x7c, ...len7c, ...innerValue];

    const { resp } = await this.transmit(
      {
        CLA: APDU_KEYS.CLASS_BYTE.STANDARD_COMMAND,
        INS: APDU_KEYS.INSTRUCTION.GENERAL_AUTHENTICATE,
        P1: APDU_KEYS.P1.P256ECDH,
        P2: slot
      },
      tlv7c
    );
    return resp;
  }

  private extractEccPublicKey(fullData: number[]) {
    for (let i = 0; i < fullData.length - 36; i++) {
      const tag = fullData[i];
      const len = fullData[i + 1];
      const zeroPad = fullData[i + 2];
      const prefix = fullData[i + 3];

      if (tag === 0x03 && len === 0x42 && zeroPad === 0x00 && prefix === 0x04) {
        const keyStart = i + 4;
        const keyEnd = keyStart + 32;
        if (keyEnd <= fullData.length) {
          const xBytes = new Uint8Array(fullData.slice(keyStart, keyEnd));
          const yBytes = new Uint8Array(fullData.slice(keyEnd, keyEnd + 32));
          return { xBytes, yBytes };
        }
      }
    }
    return { xBytes: null, yBytes: null };
  }

  async getPublicKey(slot: number) {
    let { resp } = await this.transmit(
      {
        CLA: APDU_KEYS.CLASS_BYTE.STANDARD_COMMAND,
        INS: APDU_KEYS.INSTRUCTION.GET_DATA,
        P1: APDU_KEYS.P1.PUBLIC_KEY,
        P2: APDU_KEYS.P2.PUBLIC_KEY
      },
      [0x5c, 0x03, (slot >> 16) & 0xff, (slot >> 8) & 0xff, slot & 0xff]
    );

    const data = [...resp.slice(0, -2)];

    while (true) {
      const sw1 = resp.at(-2)!;
      const sw2 = resp.at(-1)!;
      if (sw1 !== SW_CODES.MORE_DATA) {
        break;
      }
      const le = sw2 === 0x00 ? 256 : sw2;
      const getResponse = new Uint8Array([
        APDU_KEYS.CLASS_BYTE.STANDARD_COMMAND,
        APDU_KEYS.INSTRUCTION.GET_RESPONSE,
        APDU_KEYS.P1.BY_FID,
        APDU_KEYS.P2.FIRST,
        le
      ]);
      resp = await this.card.transmit(getResponse);
      data.push(...resp.slice(0, -2));
    }

    const { xBytes, yBytes } = this.extractEccPublicKey(data);

    if (!xBytes) {
      return null;
    }

    const prefix = yBytes[yBytes.length - 1]! % 2 === 0 ? 0x02 : 0x03;

    return bech32.encodeFromBytes(
      KEY_PREFIX,
      new Uint8Array([prefix, ...xBytes])
    );
  }
}

function withYubiKeyClient(
  callback: (yubiKey: YubiKeyClient) => Promise<void> | void,
  onError: (error: Err | string) => Promise<void> | void
) {
  let started = false;
  const client = new Client()
    .on('reader', (reader) => {
      reader.on('change', async (status) => {
        let card: Card | null = null;
        try {
          if (!status.has(ReaderStatus.PRESENT)) {
            return;
          }
          if (status.hasAny(ReaderStatus.MUTE, ReaderStatus.IN_USE)) {
            return;
          }
          if (started) {
            return;
          }
          started = true;
          card = await reader.connect(CardMode.SHARED);
          const yubiKey = new YubiKeyClient(card);
          await callback(yubiKey);
          await card.disconnect(CardDisposition.RESET);
          client.stop();
        } catch (err) {
          onError(`${err}`);
          card?.disconnect(CardDisposition.RESET);
        }
      });
    })
    .on('error', (error) => {
      onError(error);
    })
    .start();
}

export { RETIRED_SLOTS, withYubiKeyClient, YubiKeyClient };
