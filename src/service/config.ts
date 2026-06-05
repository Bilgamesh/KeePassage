import { join } from 'node:path';
import { readFile, writeFile } from 'atomically';
import { DEFAULT_SETTINGS } from '#/data/constants';
import { getSystemLocale } from '#/data/i18n';
import type { AppState } from '#/data/shared-state';
import { getRootDirname, isFile } from '#/renderer/package';
import { Settings } from '#/schemas/settings-schema';

const path = join(getRootDirname(), 'settings.json');
let isInit = false;

async function initConfigFile(state: AppState) {
  const { setAppSettings } = state;
  if (isInit) return;
  const exists = isFile(path, { silent: true });
  if (!exists) {
    const settings = { ...DEFAULT_SETTINGS, language: getSystemLocale() };
    await writeFile(path, JSON.stringify(settings, null, 2));
  }
  isInit = true;
  setAppSettings(await getSettings(state));
}

async function getSettings(state: AppState) {
  try {
    await initConfigFile(state);
    const file = await readFile(path);
    const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(file.toString()) };
    return Settings.parse(settings);
  } catch (err) {
    console.error(`Failed to read settings: ${err}`);
    return DEFAULT_SETTINGS;
  }
}

async function updateSettings(
  callback: (settings: Settings) => Promise<Settings> | Settings,
  state: AppState
) {
  const { setAppSettings } = state;
  await initConfigFile(state);
  const settings = await getSettings(state);
  const updated = await callback(settings);
  await writeFile(path, JSON.stringify(updated, null, 2));
  setAppSettings(updated);
}

export { getSettings, initConfigFile, updateSettings };
