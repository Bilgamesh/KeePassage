import { DEFAULT_SETTINGS } from '@/data/constants';
import { DbIndex, Entry } from '@/schemas/database-schema';
import { createSignal } from 'solid-js';

export const [mainPageIndex, setMainPageIndex] = createSignal(0);
export const [appSettings, setAppSettings] = createSignal(DEFAULT_SETTINGS);
export const [selectedDbPath, setSelectedDbPath] = createSignal('');
export const [unlockedDbIndex, setUnlockedDbIndex] = createSignal<DbIndex | null>(null);
export const [selectedEntry, setSelectedEntry] = createSignal<Entry | null>(null);
export const [filter, setFilter] = createSignal<{ run: (entry: Entry) => boolean }>({
  run: () => true
});
export const [copyingEnabled, setCopyingEnabled] = createSignal(true);
