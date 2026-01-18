import { flatten, type Flatten, translator } from '@solid-primitives/i18n';
import { readdirSync } from 'fs';
import { createRequire } from 'module';
import { join } from 'path';

import { checkIfPacked, getResourcePath, getRootDirname } from '@/renderer/package';

import type * as en from '@/assets/texts/en.json';
import { appSettings } from '@/data/shared-state';

type RawDictionary = typeof en;
type Dictionary = Flatten<RawDictionary>;

const require = createRequire(import.meta.url);

const folder = checkIfPacked()
  ? getResourcePath('texts')
  : join(getRootDirname(), 'src', 'assets', 'texts');

function getDictionaries() {
  const names = readdirSync(folder).map((file) => file.toLocaleLowerCase().replace('.json', ''));
  const dicts = [];
  for (const name of names) {
    const dict = fetchDictionary(name);
    dicts.push(dict);
  }
  return dicts;
}

const dictionaries = getDictionaries();

function fetchDictionary(locale: string): Dictionary {
  const path = join(folder, `${locale}.json`);
  const dict: RawDictionary = require(path);
  return flatten(dict);
}

const t = translator(() => {
  const dict = dictionaries.find((d) => d.languageCode === appSettings().language);
  if (!dict) {
    throw new Error('Attempted to translate with `null` dictionary');
  }
  return dict.content;
});

export { dictionaries, t };
