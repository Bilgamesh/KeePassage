import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { type Flatten, flatten, translator } from '@solid-primitives/i18n';
import { Locale } from 'gui';
import type * as en from '#/assets/texts/en.json';
import { appSettings } from '#/data/shared-state';
import {
  checkIfPacked,
  getResourcePath,
  getRootDirname
} from '#/renderer/package';

type RawDictionary = typeof en;
type Dictionary = Flatten<RawDictionary>;

const require = createRequire(import.meta.url);

const folder = checkIfPacked()
  ? getResourcePath('texts')
  : join(getRootDirname(), 'src', 'assets', 'texts');

function getDictionaries() {
  const names = readdirSync(folder).map((file) =>
    file.toLocaleLowerCase().replace('.json', '')
  );
  const dicts = [];
  for (const name of names) {
    const dict = fetchDictionary(name);
    dicts.push({ languageCode: name, content: dict });
  }
  return dicts;
}

function fetchDictionary(locale: string): Dictionary {
  const path = join(folder, `${locale}.json`);
  const dict: RawDictionary = require(path);
  return flatten(dict);
}

function sanitizeLocale(locale: string) {
  return (
    {
      'pl-PL': 'pl',
      'en-US': 'en',
      'en-GB': 'en'
    }[locale] || 'en'
  );
}

function getSystemLocale() {
  return sanitizeLocale(Locale.getCurrentIdentifier());
}

const t = translator(() => {
  const dict = dictionaries.find(
    (d) => d.languageCode === appSettings().language
  );
  if (!dict) {
    throw new Error('Attempted to translate with `null` dictionary');
  }
  return dict.content;
});

const dictionaries = getDictionaries();

export { dictionaries, getSystemLocale, t };
