import { appearance } from 'gui';
import { createSignal } from 'solid-js';
import { DEFAULT_SETTINGS } from '#/data/constants';
import type { DbIndex, Entry } from '#/schemas/database-schema';

type Filter = { run: (entry: Entry) => boolean };
type Nullable<T> = T | null;

export const [appSettings, setAppSettings] = createSignal(DEFAULT_SETTINGS);
export const [selectedDbPath, setSelectedDbPath] = createSignal('');
export const [unlockedDbIndex, setUnlockedDbIndex] =
  createSignal<Nullable<DbIndex>>(null);
export const [selectedEntry, setSelectedEntry] =
  createSignal<Nullable<Entry>>(null);
export const [filter, setFilter] = createSignal<Filter>({ run: () => true });
export const [copyingEnabled, setCopyingEnabled] = createSignal(true);
export const [isDark, setDark] = createSignal(appearance.isDarkScheme());
