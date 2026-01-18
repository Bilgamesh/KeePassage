import { createEffect, createSignal } from 'solid-js';

import { EntryLine } from '@/components/entry-line';
import { EntryTextArea } from '@/components/entry-text-area';
import { Expand } from '@/components/expand';
import { IconButton } from '@/components/icon-button';
import { LARGE_BUTTON_STYLE, PAGE_INDEXES, SMALL_ENTRY_STYLE } from '@/data/constants';
import { mainPageIndex, setMainPageIndex, unlockedDbIndex } from '@/data/shared-state';
import { getGeneratedPassword } from '@/pages/pw-generator-page';
import { Entry } from '@/schemas/database-schema';
import { encrypt } from '@/service/pcsc-service';
import { createListeners } from '@/utils/listen-util';

import diceIcon from '@/assets/icons/dice-3.png';
import eyeOffIcon from '@/assets/icons/eye-off.png';
import eyeIcon from '@/assets/icons/eye.png';

let controller: AbortController;
const [passwordVisible, setPasswordVisible] = createSignal(false);
const [title, setTitle] = createSignal('');
const [username, setUsername] = createSignal('');
const [password, setPassword] = createSignal('');
const [url, setUrl] = createSignal('');
const [tags, setTags] = createSignal('');
const [notes, setNotes] = createSignal('');
const [modified, setModified] = createSignal(new Date().getTime());

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

function restoreRawEntry(form: Omit<Entry, 'encryptedPayloads'> & { password: string }) {
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
    const entry = await entryListeners.waitForValue({ signal: controller.signal });
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
    setModified(new Date().getTime());
  });

  async function onEntrySubmit() {
    const encryptedPayloads: string[] = [];
    if (!unlockedDbIndex()) {
      throw new Error('No unlocked DB Index');
    }
    for (const key of unlockedDbIndex()!.keys) {
      const encryptedPayload = await encrypt({ password: password() }, key.publicKey, {
        signal: controller.signal
      });
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
      <EntryLine title="Title:" text={title} onTextChange={setTitle} />
      <EntryLine title="Username:" text={username} onTextChange={setUsername} />
      <EntryLine
        title="Password:"
        text={password}
        type={passwordVisible() ? 'normal' : 'password'}
        onTextChange={setPassword}
      >
        <IconButton
          tooltip="Password generator"
          src={diceIcon}
          size={{ height: SMALL_ENTRY_STYLE.height!, width: 20 }}
          imageSize={{ height: 13, width: 13 }}
          style={{
            'margin-top': 0,
            'margin-left': 4
          }}
          onClick={async () => {
            const oldEntry = getRawEntry();
            const pw = await getGeneratedPassword();
            restoreRawEntry({ ...oldEntry, password: pw || oldEntry.password });
          }}
        />
        <IconButton
          tooltip="Preview password"
          src={passwordVisible() ? eyeOffIcon : eyeIcon}
          size={{ height: SMALL_ENTRY_STYLE.height!, width: 20 }}
          imageSize={{ height: 13, width: 13 }}
          style={{
            'margin-top': 0,
            'margin-left': 2
          }}
          onClick={() => {
            setPasswordVisible((v) => !v);
          }}
        />
      </EntryLine>
      <EntryLine title="URL:" text={url} onTextChange={setUrl} />
      <EntryLine title="Tags:" text={tags} onTextChange={setTags} />
      <EntryTextArea
        title="Notes:"
        text={notes}
        style={{ flex: 1, flexDirection: 'row', 'margin-top': 10 }}
        onTextChange={setNotes}
      />
      <container style={{ flexDirection: 'row', 'margin-top': 20 }}>
        <Expand direction="row" />
        <button
          title="OK"
          enabled={title().trim().length > 0}
          style={LARGE_BUTTON_STYLE}
          onClick={() => {
            setModified(new Date().getTime());
            onEntrySubmit();
          }}
        />
        <button
          title="Cancel"
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 20 }}
          onClick={(button) => {
            controller.abort('Cancel');
          }}
        />
      </container>
    </container>
  );
}

export { EntryPage, requestEntry };
