import { DbFile, DbIndex } from '@/schemas/database-schema';
import { YubiKey } from '@/schemas/yubikey-schema';

import { decryptIndex, encryptIndex } from '@/service/index-encryptor';
import { decrypt, detectYubiKey, encrypt } from '@/service/pcsc-service';

import { readFile, writeFile } from 'fs/promises';

async function writeDatabase(path: string, dbFile: DbFile) {
  const stringified = JSON.stringify(dbFile);
  const encoded = Buffer.from(stringified).toString('base64');
  await writeFile(path, encoded);
}

async function addDatabase(config: {
  name: string;
  description: string;
  path: string;
  keys: YubiKey[];
}) {
  const { encrypted, indexKey } = await encryptIndex({
    version: 1,
    name: config.name,
    description: config.description,
    secrets: [],
    keys: config.keys
  });
  const encryptedIndexKeys: string[] = [];

  for (const key of config.keys) {
    const encrypted = await encrypt({ password: indexKey }, key.publicKey);
    encryptedIndexKeys.push(encrypted);
  }

  const dbFile: DbFile = {
    i: encrypted,
    k: encryptedIndexKeys,
    s: config.keys.map((k) => ({
      serial: k.serial,
      slot: k.slot,
      publicKey: k.publicKey
    }))
  };

  await writeDatabase(config.path, dbFile);
}

async function getMatchingKey(dbFile: DbFile, timeoutMs?: number) {
  try {
    const { publicKey, serial, slot } = await detectYubiKey({
      timeoutMs
    });
    for (let i = 0; i < dbFile.s.length; i++) {
      const { publicKey: requiredKey } = dbFile.s[i]!;
      if (requiredKey === publicKey) {
        return { encryptedIndexKey: dbFile.k[i]!, serial, slot, publicKey, index: i };
      }
    }
    return null;
  } catch (err) {
    console.error(`Failed to detect matching YubiKey key: ${err}`);
    return null;
  }
}

async function unlockDatabase(
  dbFile: DbFile,
  key: {
    encryptedIndexKey: string;
    pin: number;
    publicKey: string;
    slot: number;
  },
  options?: { signal?: AbortSignal }
) {
  const { password: indexKey } = await decrypt(
    key.encryptedIndexKey,
    key.pin,
    key.publicKey,
    key.slot,
    options
  );
  return await decryptIndex(dbFile.i, indexKey);
}

async function loadDatabase(path: string) {
  const dbFileRaw = await readFile(path, 'utf-8');
  const decoded = Buffer.from(dbFileRaw, 'base64').toString('utf-8');
  const dbFile = DbFile.parse(JSON.parse(decoded));
  return dbFile;
}

async function saveDatabase(config: { db: DbIndex; path: string }) {
  const { encrypted, indexKey } = await encryptIndex({
    version: config.db.version + 1,
    name: config.db.name,
    description: config.db.description,
    secrets: config.db.secrets,
    keys: config.db.keys
  });
  const encryptedIndexKeys: string[] = [];

  for (const key of config.db.keys) {
    const encrypted = await encrypt({ password: indexKey }, key.publicKey);
    encryptedIndexKeys.push(encrypted);
  }

  const dbFile: DbFile = {
    i: encrypted,
    k: encryptedIndexKeys,
    s: config.db.keys.map((k) => ({
      serial: k.serial,
      slot: k.slot,
      publicKey: k.publicKey
    }))
  };

  await writeDatabase(config.path, dbFile);
}

export { addDatabase, getMatchingKey, loadDatabase, saveDatabase, unlockDatabase };
