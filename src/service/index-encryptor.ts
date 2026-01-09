import { DbIndex } from '@/schemas/database-schema';
import { randomBytes } from 'crypto';
import sodium from 'libsodium-wrappers';

function generateIndexKeyString() {
  const bytes = randomBytes(32);
  return bytes.toString('base64');
}

async function deriveMasterKey(text: string) {
  await sodium.ready;
  const input = Buffer.from(text, 'utf8');

  return sodium.crypto_generichash(
    sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
    input,
    Buffer.from('keepassage:master-key')
  );
}

async function encryptIndex(indexObject: DbIndex) {
  await sodium.ready;
  const indexKey = generateIndexKeyString();
  const masterKeyBuffer = await deriveMasterKey(indexKey);

  const plaintext = Buffer.from(JSON.stringify(indexObject), 'utf8');
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const ad = Buffer.from(`keepassage:index:v${indexObject.version}`);
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    ad,
    null,
    nonce,
    masterKeyBuffer
  );
  const data = Buffer.from(
    JSON.stringify({
      nonce: Buffer.from(nonce).toString('base64'),
      ad: ad.toString('base64'),
      data: Buffer.from(ciphertext).toString('base64')
    })
  ).toString('base64');
  return {
    indexKey,
    encrypted: data
  };
}

async function decryptIndex(encrypted: string, indexKey: string): Promise<DbIndex> {
  await sodium.ready;
  const masterKeyBuffer = await deriveMasterKey(indexKey);
  const data = JSON.parse(Buffer.from(encrypted, 'base64').toString('utf-8')) as {
    nonce: string;
    ad: string;
    data: string;
  };
  const ciphertext = Buffer.from(data.data, 'base64');
  const nonce = Buffer.from(data.nonce, 'base64');
  const ad = Buffer.from(data.ad, 'base64');

  const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    ad,
    nonce,
    masterKeyBuffer
  );
  return JSON.parse(Buffer.from(plaintext).toString('utf-8'));
}

export { decryptIndex, encryptIndex };
