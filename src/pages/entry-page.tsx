import { createEffect, createSignal } from 'solid-js';
import diceIcon from '#/assets/icons/dice-3.png';
import eyeIcon from '#/assets/icons/eye.png';
import eyeOffIcon from '#/assets/icons/eye-off.png';
import { EntryLine } from '#/components/entry-line';
import { EntryTextArea } from '#/components/entry-text-area';
import { Expand } from '#/components/expand';
import { IconButton } from '#/components/icon-button';
import {
  LARGE_BUTTON_STYLE,
  PAGE_INDEXES,
  SMALL_ENTRY_STYLE
} from '#/data/constants';
import { t } from '#/data/i18n';
import {
  mainPageIndex,
  setMainPageIndex,
  unlockedDbIndex
} from '#/data/shared-state';
import { getGeneratedPassword } from '#/pages/pw-generator-page';
import type { Entry } from '#/schemas/database-schema';
import { encrypt } from '#/service/pcsc-service';
import { createListeners } from '#/utils/listen-util';

let controller: AbortController;
const [passwordVisible, setPasswordVisible] = createSignal(false);
const [title, setTitle] = createSignal('');
const [username, setUsername] = createSignal('');
const [password, setPassword] = createSignal('');
const [url, setUrl] = createSignal('');
const [tags, setTags] = createSignal('');
const [notes, setNotes] = createSignal('');
const [modified, setModified] = createSignal(Date.now());

const entryListeners = createListeners<Entry>();

function getRawEntry() {
  return {
    title: title(),
    username: username(),
    password: password(),
    url: url(),
    tags: tags(),
    notes: notes(),
    modified: modified()
  };
}

function restoreRawEntry(
  form: Omit<Entry, 'encryptedPayloads'> & { password: string }
) {
  setTitle(form.title);
  setUsername(form.username);
  setPassword(form.password);
  setUrl(form.url);
  setTags(form.tags);
  setNotes(form.notes);
  setModified(form.modified);
}

async function requestEntry(password?: string, existingEntry?: Entry) {
  controller = new AbortController();
  setPasswordVisible(false);
  setMainPageIndex(PAGE_INDEXES.ENTRY);
  if (existingEntry && typeof password === 'string') {
    restoreRawEntry({ ...existingEntry, password });
  }
  try {
    const entry = await entryListeners.waitForValue({
      signal: controller.signal
    });
    return entry;
  } catch (err) {
    console.error(`Failed to get entry: ${err}`);
    return null;
  }
}

function EntryPage() {
  createEffect(() => {
    mainPageIndex();
    setTitle('');
    setUsername('');
    setPassword('');
    setUrl('');
    setTags('');
    setNotes('');
    setModified(Date.now());
  });

  async function onEntrySubmit() {
    const encryptedPayloads: string[] = [];
    if (!unlockedDbIndex()) {
      throw new Error('No unlocked DB Index');
    }
    for (const key of unlockedDbIndex()?.keys ?? []) {
      const encryptedPayload = await encrypt(
        { password: password() },
        key.publicKey,
        {
          signal: controller.signal
        }
      );
      encryptedPayloads.push(encryptedPayload);
    }
    entryListeners.notifyListeners({
      title: title(),
      username: username(),
      encryptedPayloads: encryptedPayloads,
      url: url(),
      tags: tags(),
      notes: notes(),
      modified: modified()
    });
  }

  return (
    <container style={{ flex: 1, margin: 20, 'margin-right': 40 }}>
      <EntryLine
        onTextChange={setTitle}
        text={title}
        title={`${t('title')}:`}
      />
      <EntryLine
        onTextChange={setUsername}
        text={username}
        title={`${t('username')}:`}
      />
      <EntryLine
        onTextChange={setPassword}
        text={password}
        title={t('password')}
        type={passwordVisible() ? 'normal' : 'password'}
      >
        <IconButton
          imageSize={{ height: 13, width: 13 }}
          onClick={async () => {
            const oldEntry = getRawEntry();
            const pw = await getGeneratedPassword();
            restoreRawEntry({ ...oldEntry, password: pw || oldEntry.password });
          }}
          size={{ height: SMALL_ENTRY_STYLE.height!, width: 20 }}
          src={diceIcon}
          style={{
            'margin-top': 0,
            'margin-left': 4
          }}
          tooltip={t('passwordGenerator')}
        />
        <IconButton
          imageSize={{ height: 13, width: 13 }}
          onClick={() => {
            setPasswordVisible((v) => !v);
          }}
          size={{ height: SMALL_ENTRY_STYLE.height!, width: 20 }}
          src={passwordVisible() ? eyeOffIcon : eyeIcon}
          style={{
            'margin-top': 0,
            'margin-left': 2
          }}
          tooltip={t('previewPassword')}
        />
      </EntryLine>
      <EntryLine onTextChange={setUrl} text={url} title={t('url')} />
      <EntryLine onTextChange={setTags} text={tags} title={t('tags')} />
      <EntryTextArea
        onTextChange={setNotes}
        style={{ flex: 1, flexDirection: 'row', 'margin-top': 10 }}
        text={notes}
        title={t('notes')}
      />
      <container style={{ flexDirection: 'row', 'margin-top': 20 }}>
        <Expand direction="row" />
        <button
          enabled={title().trim().length > 0}
          onClick={() => {
            setModified(Date.now());
            onEntrySubmit();
          }}
          style={LARGE_BUTTON_STYLE}
          title={t('ok')}
        />
        <button
          onClick={(_button) => {
            controller.abort('Cancel');
          }}
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 20 }}
          title={t('cancel')}
        />
      </container>
    </container>
  );
}

export { EntryPage, requestEntry };
