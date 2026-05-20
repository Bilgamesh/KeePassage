import { createSignal, Index } from 'solid-js';
import { navigator } from '#/app';
import diceIcon from '#/assets/icons/dice-3.png';
import eyeIcon from '#/assets/icons/eye.png';
import eyeOffIcon from '#/assets/icons/eye-off.png';
import trashIcon from '#/assets/icons/trash.png';
import { LARGE_BUTTON_STYLE, SMALL_ENTRY_STYLE } from '#/data/constants';
import { t } from '#/data/i18n';
import { unlockedDbIndex } from '#/data/shared-state';
import type { CustomSecret, Entry, Payload } from '#/schemas/database-schema';
import { encrypt } from '#/service/yubikey';
import { createListeners } from '#/utils/listen';
import { blur } from '#/utils/ui';
import { EntryLine } from '#/views/components/entry-line';
import { EntryTextArea } from '#/views/components/entry-text-area';
import { Expand } from '#/views/components/expand';
import { IconButton } from '#/views/components/icon-button';
import { getGeneratedPassword } from '#/views/pages/pw-generator';

type BlankEntry = Omit<Entry, 'encryptedPayloads'>;
type WithPayload = { payload: Payload };
type Form = BlankEntry & WithPayload;
type EditableCustomSecret = CustomSecret & {
  editable: boolean;
  visible: boolean;
};

let controller: AbortController;
const [passwordVisible, setPasswordVisible] = createSignal(false);
const [title, setTitle] = createSignal('');
const [username, setUsername] = createSignal('');
const [password, setPassword] = createSignal('');
const [url, setUrl] = createSignal('');
const [tags, setTags] = createSignal('');
const [notes, setNotes] = createSignal('');
const [modified, setModified] = createSignal(Date.now());
const [customSecrets, setCustomSecrets] = createSignal<EditableCustomSecret[]>(
  []
);
const updateCustomSecret = (
  index: number,
  callback: (secret: EditableCustomSecret) => EditableCustomSecret
) => {
  const secrets = customSecrets();
  secrets[index] = { ...callback(customSecrets()[index]!) };
  setCustomSecrets([...secrets]);
};
const deleteCustomSecret = (index: number) => {
  const secrets = customSecrets();
  secrets.splice(index, 1);
  setCustomSecrets([...secrets]);
};

const entryListeners = createListeners<Entry>();

function getRawEntry() {
  return {
    title: title(),
    username: username(),
    password: password(),
    url: url(),
    tags: tags(),
    notes: notes(),
    modified: modified(),
    customSecrets: customSecrets()
  };
}

function restoreRawEntry(form: Form) {
  setTitle(form.title);
  setUsername(form.username);
  setPassword(form.payload.password);
  setUrl(form.url);
  setTags(form.tags);
  setNotes(form.notes);
  setModified(form.modified);
  setCustomSecrets(
    (form.payload.customSecrets ?? []).map((v) => ({
      ...v,
      editable: false,
      visible: false
    }))
  );
}

async function requestEntry(payload?: Payload, existingEntry?: Entry) {
  controller = new AbortController();
  setPasswordVisible(false);
  navigator.push((pages) => ({
    index: pages.ENTRY,
    cleanup: () => {
      if (controller && !controller.signal.aborted)
        controller.abort('Page cleanup');
    }
  }));
  if (existingEntry && payload) {
    restoreRawEntry({ ...existingEntry, payload });
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
  navigator.subscribe(() => {
    setTitle('');
    setUsername('');
    setPassword('');
    setUrl('');
    setTags('');
    setNotes('');
    setModified(Date.now());
    setCustomSecrets([]);
  });

  async function onEntrySubmit() {
    const encryptedPayloads: string[] = [];
    if (!unlockedDbIndex()) {
      throw new Error('No unlocked DB Index');
    }
    for (const key of unlockedDbIndex()?.keys ?? []) {
      const encryptedPayload = await encrypt(
        { password: password(), customSecrets: customSecrets() },
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
        title={() => `${t('title')}:`}
      />
      <EntryLine
        onTextChange={setUsername}
        text={username}
        title={() => `${t('username')}:`}
      />
      <EntryLine
        onTextChange={setPassword}
        text={password}
        title={() => t('password')}
        type={passwordVisible() ? 'normal' : 'password'}
      >
        <IconButton
          imageSize={{ height: 13, width: 13 }}
          onClick={async (b) => {
            const oldEntry = getRawEntry();
            const pw = await getGeneratedPassword();
            restoreRawEntry({
              ...oldEntry,
              payload: {
                password: pw || oldEntry.password,
                customSecrets: oldEntry.customSecrets
              }
            });
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
      <EntryLine onTextChange={setUrl} text={url} title={() => t('url')} />
      <EntryLine onTextChange={setTags} text={tags} title={() => t('tags')} />
      <Index each={customSecrets()}>
        {(customSecret, index) => (
          <EntryLine
            editableTitle={customSecret().editable}
            onTextChange={(text) => {
              customSecret().value = text;
            }}
            onTitleChange={(text) => {
              customSecret().name = text;
            }}
            onTitleClick={() =>
              updateCustomSecret(index, (secret) => {
                secret.editable = true;
                return secret;
              })
            }
            onTitleSubmit={() =>
              updateCustomSecret(index, (secret) => {
                secret.editable = false;
                return secret;
              })
            }
            text={() => customSecret().value}
            title={() => customSecret().name}
            type={customSecret().visible ? 'normal' : 'password'}
          >
            <IconButton
              imageSize={{ height: 13, width: 13 }}
              onClick={() =>
                updateCustomSecret(index, (secret) => {
                  secret.visible = !secret.visible;
                  return secret;
                })
              }
              size={{ height: SMALL_ENTRY_STYLE.height!, width: 20 }}
              src={customSecret().visible ? eyeOffIcon : eyeIcon}
              style={{
                'margin-top': 0,
                'margin-left': 2
              }}
              tooltip={`${t('previewSecret')} ${customSecret().name}`}
            />
            <IconButton
              imageSize={{ height: 13, width: 13 }}
              onClick={() => {
                deleteCustomSecret(index);
              }}
              size={{ height: SMALL_ENTRY_STYLE.height!, width: 20 }}
              src={trashIcon}
              style={{
                'margin-top': 0,
                'margin-left': 2
              }}
              tooltip={t('delete')}
            />
          </EntryLine>
        )}
      </Index>
      <container style={{ flexDirection: 'row' }}>
        <container style={{ flex: 1 }} />
        <button
          onClick={() => {
            setCustomSecrets((v) => [
              ...v,
              { editable: true, visible: true, name: t('name'), value: '' }
            ]);
          }}
          style={{
            height: SMALL_ENTRY_STYLE.height!,
            width: 20,
            'margin-top': 5
          }}
          title={t('addNewSecret')}
          tooltip={t('addNewSecret')}
        />
      </container>
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
