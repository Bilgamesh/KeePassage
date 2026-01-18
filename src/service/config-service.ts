import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import { DEFAULT_SETTINGS } from '@/data/constants';
import { setAppSettings } from '@/data/shared-state';
import { getRootDirname, isFile } from '@/renderer/package';
import { Settings } from '@/schemas/settings-schema';

const path = join(getRootDirname(), 'settings.json');
let isInit = false;

async function initConfigFile() {
  if (isInit) {
    return;
  }
  const exists = isFile(path, { silent: true });
  if (!exists) {
    await writeFile(path, JSON.stringify(DEFAULT_SETTINGS, null, 2));
  }
  isInit = true;
  setAppSettings(await getSettings());
}

async function getSettings() {
  try {
    await initConfigFile();
    const file = await readFile(path);
    const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(file.toString()) };
    return Settings.parse(settings);
  } catch (err) {
    console.error(`Failed to read settings: ${err}`);
    return DEFAULT_SETTINGS;
  }
}

async function updateSettings(callback: (settings: Settings) => Promise<Settings> | Settings) {
  await initConfigFile();
  const settings = await getSettings();
  const updated = await callback(settings);
  await writeFile(path, JSON.stringify(updated, null, 2));
  setAppSettings(updated);
}

export { getSettings, initConfigFile, updateSettings };
