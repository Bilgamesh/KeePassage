import { navigator } from '#/app';
import diceIcon from '#/assets/icons/dice-3.png';
import eyeIcon from '#/assets/icons/eye.png';
import eyeOffIcon from '#/assets/icons/eye-off.png';
import { LARGE_BUTTON_STYLE, SMALL_ENTRY_STYLE } from '#/data/constants';
import { NoUnlockedDatabaseError } from '#/data/errors';
import { getTranslator } from '#/data/i18n';
import { type AppState, useAppContext } from '#/data/shared-state';
import type { Entry } from '#/schemas/database-schema';
import { encrypt } from '#/service/yubikey';
import { createListeners } from '#/utils/listen';
import { blur } from '#/utils/ui';
import { EntryLine } from '#/views/components/entry-line';
import { EntryTextArea } from '#/views/components/entry-text-area';
import { Expand } from '#/views/components/expand';
import { IconButton } from '#/views/components/icon-button';
import { getGeneratedPassword } from '#/views/pages/pw-generator';

type BlankEntry = Omit<Entry, 'encryptedPayloads'>;
type WithPassword = { password: string };
type Form = BlankEntry & WithPassword;

let controller: AbortController;

const entryListeners = createListeners<Entry>();

function getRawEntry(state: AppState) {
  const { title, username, password, url, tags, notes, modified } = state;
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

function restoreRawEntry(form: Form, state: AppState) {
  state.setTitle(form.title);
  state.setUsername(form.username);
  state.setPassword(form.password);
  state.setUrl(form.url);
  state.setTags(form.tags);
  state.setNotes(form.notes);
  state.setModified(form.modified);
}

async function requestEntry(
  state: AppState,
  password?: string,
  existingEntry?: Entry
) {
  controller = new AbortController();
  state.setPasswordVisible(false);
  navigator.push((pages) => ({
    index: pages.ENTRY,
    cleanup: () => {
      if (controller && !controller.signal.aborted)
        controller.abort('Page cleanup');
    }
  }));
  if (existingEntry && typeof password === 'string')
    restoreRawEntry({ ...existingEntry, password }, state);
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
  const state = useAppContext();
  const {
    unlockedDbIndex,
    setTitle,
    setUsername,
    setPassword,
    setUrl,
    setTags,
    setNotes,
    setModified,
    title,
    username,
    url,
    tags,
    notes,
    modified,
    password,
    passwordVisible,
    setPasswordVisible
  } = state;

  const t = getTranslator(state);

  navigator.subscribe(() => {
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
    if (!unlockedDbIndex()) throw new NoUnlockedDatabaseError();
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
          onClick={async (b) => {
            const oldEntry = getRawEntry(state);
            const pw = await getGeneratedPassword(state);
            restoreRawEntry(
              {
                ...oldEntry,
                password: pw || oldEntry.password
              },
              state
            );
            blur(b);
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
          onClick={(b) => {
            setModified(Date.now());
            onEntrySubmit();
            blur(b);
          }}
          style={LARGE_BUTTON_STYLE}
          title={t('ok')}
        />
        <button
          onClick={(b) => {
            controller.abort('Cancel');
            blur(b);
          }}
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 20 }}
          title={t('cancel')}
        />
      </container>
    </container>
  );
}

export { EntryPage, requestEntry };
