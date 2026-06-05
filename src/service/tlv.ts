import { MissingTlvTagError, SignatureNotFoundError } from '#/data/errors';

function encodeLength(len: number): number[] {
  if (len < 0x80) return [len];
  else if (len <= 0xff) return [0x81, len];
  else return [0x82, (len >> 8) & 0xff, len & 0xff];
}

function extractEccPublicKey(fullData: number[]) {
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

function extractSignature(resp: Uint8Array) {
  const i = resp.indexOf(0x82);
  if (i === -1) throw new SignatureNotFoundError();
  const len = resp[i + 1]!;
  return resp.slice(i + 2, i + 2 + len);
}

function wrapCertificate(certDer: Uint8Array) {
  return new Uint8Array([
    0x70,
    ...encodeLength(certDer.length),
    ...certDer,
    0x71,
    0x01,
    0x00,
    0xfe,
    0x00
  ]);
}

function parseSimpleTlv(data: Uint8Array) {
  const result = new Map<number, Uint8Array>();
  let offset = 0;
  while (offset < data.length) {
    const tag = data[offset++]!;
    let len = data[offset++]!;
    if (len & 0x80) {
      const bytes = len & 0x7f;
      len = 0;
      for (let i = 0; i < bytes; i++) len = (len << 8) | data[offset++]!;
    }
    result.set(tag, data.slice(offset, offset + len));
    offset += len;
  }
  return result;
}

function getNestedTlv(data: Uint8Array, ...tags: number[]) {
  let current = data;
  for (const tag of tags) {
    const parsed = parseSimpleTlv(current);
    const next = parsed.get(tag);
    if (!next) throw new MissingTlvTagError(tag);
    current = next;
  }
  return current;
}

export {
  encodeLength,
  extractEccPublicKey,
  extractSignature,
  getNestedTlv,
  parseSimpleTlv,
  wrapCertificate
};
