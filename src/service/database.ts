import { Clipboard, FileSaveDialog, MessageBox, type Window } from 'gui';
import { toString as qrCodeToString } from 'qrcode';
import type { Accessor } from 'solid-js';
import { navigator } from '#/app';
import { DATABASE_EXTENSION } from '#/data/constants';
import { t } from '#/data/i18n';
import {
  appSettings,
  selectedDbPath,
  selectedEntry,
  setSelectedDbPath,
  setUnlockedDbIndex,
  unlockedDbIndex
} from '#/data/shared-state';
import { render } from '#/renderer';
import type { Entry } from '#/schemas/database-schema';
import type { YubiKey } from '#/schemas/yubikey-schema';
import { updateSettings } from '#/service/config';
import {
  addDatabase,
  getMatchingKey,
  loadDatabase,
  saveDatabase,
  unlockDatabase
} from '#/service/lib/database/database-client';
import { decrypt } from '#/service/yubikey';
import { showError } from '#/utils/message-box';
import { QRCode } from '#/views/components/qrcode';
import { requestEntry } from '#/views/pages/entry';
import { requestPin } from '#/views/pages/pinentry';
import { requestTouch } from '#/views/pages/touch';
import { MainWindow } from '#/views/windows/main';
import { QrCodeWindow } from '#/views/windows/qr-code';

async function openDatabase(window: Window, path: string) {
  const previousPath = selectedDbPath();
  setSelectedDbPath(path);
  const dbFile = await loadDatabase(path);
  const key = await getMatchingKey(dbFile, 1000);
  if (!key)
    return showError(
      window,
      `${t('pleaseConnectCorrectKey')}:\n${dbFile.s.map((s) => s.serial).join(', ')}`,
      {
        title: t('keyNotConnected')
      }
    );

  const pin = await requestPin(navigator, key.serial);
  if (!pin) {
    setSelectedDbPath(previousPath);
    navigator.pop();
    return;
  }
  try {
    const signal = requestTouch(navigator);
    const index = await unlockDatabase(
      dbFile,
      {
        encryptedIndexKey: key.encryptedIndexKey,
        publicKey: key.publicKey,
        slot: key.slot,
        pin
      },
      { signal }
    );
    setUnlockedDbIndex({ ...index });
    navigator.replace({
      from: (pages) => [pages.TOUCH, pages.PINTENTRY],
      to: (pages) => pages.DB_INDEX
    });
  } catch (err) {
    console.error(`Failed to open database: ${err}`);
    if (!(err instanceof DOMException) || err.name !== 'AbortError')
      showError(window, err);
    setSelectedDbPath(previousPath);
    navigator.replace({
      from: (pages) => [pages.TOUCH, pages.PINTENTRY],
      to: (pages) => pages.WELCOME
    });
  }
  await updateSettings((settings) => {
    const index = settings.recent.indexOf(path);
    if (index === -1) settings.recent.unshift(path);
    else settings.recent.unshift(settings.recent.splice(index, 1)[0]!);
    return settings;
  });
}

async function saveNewDatabase(options: {
  window: Window;
  mainWindow: Window;
  selectedKeys: Accessor<YubiKey[]>;
  dbName: Accessor<string>;
  description: Accessor<string>;
}) {
  const { dbName, description, mainWindow, selectedKeys, window } = options;
  if (selectedKeys().length === 1) {
    const msgBox = MessageBox.create();
    msgBox.setTitle(t('backupRequired'));
    msgBox.setType('warning');
    msgBox.setText(t('youHaveOnlySelected1'));
    msgBox.addButton(t('cancel'), -1);
    msgBox.addButton(t('continueWithoutBak'), 1);
    if (msgBox.runForWindow(window) !== 1) return;
  }

  const dialog = FileSaveDialog.create();
  dialog.setFilename(dbName());
  dialog.setFilters([
    {
      description: t('keepassageDb'),
      extensions: [DATABASE_EXTENSION]
    }
  ]);

  if (dialog.runForWindow(window)) {
    const path = dialog.getResult();
    await addDatabase({
      keys: selectedKeys(),
      name: dbName(),
      description: description(),
      path
    });
    await updateSettings((settings) => {
      const index = settings.recent.indexOf(path);
      if (index !== -1) settings.recent.splice(index, 1);
      settings.recent.unshift(path);
      return settings;
    });
    window.close();
    mainWindow.activate();
  }
}

async function getPassword(options: { entry: Entry; window: Window }) {
  const { entry, window } = options;
  const path = selectedDbPath();
  const dbFile = await loadDatabase(path);
  const key = await getMatchingKey(dbFile, 1000);
  if (!key) {
    showError(
      window,
      `${t('pleaseConnectCorrectKey')}:\n${dbFile.s.map((s) => s.serial).join(', ')}`,
      {
        title: t('keyNotConnected')
      }
    );
    return null;
  }
  const pin = await requestPin(navigator, key.serial, entry.title);
  if (!pin) {
    navigator.replace({
      from: (pages) => [pages.TOUCH, pages.PINTENTRY],
      to: (pages) => pages.DB_INDEX
    });
    return null;
  }
  try {
    const signal = requestTouch(navigator);
    const { password } = await decrypt(
      entry.encryptedPayloads[key.index]!,
      pin,
      key.publicKey,
      key.slot,
      { signal }
    );
    return password;
  } catch (err) {
    console.error(`Failed to decrypt password: ${err}`);
    if (!(err instanceof DOMException) || err.name !== 'AbortError')
      showError(window, err);
    return null;
  }
}

async function addNewEntry() {
  const entry = await requestEntry();
  navigator.replace({
    from: (pages) => pages.ENTRY,
    to: (pages) => pages.DB_INDEX
  });
  if (entry) {
    setUnlockedDbIndex((db) => {
      db?.secrets.push(entry);
      return { ...db! };
    });
    saveDatabase({
      db: unlockedDbIndex()!,
      path: selectedDbPath()
    });
  }
}

async function editEntry(window: Window) {
  const entry = selectedEntry();
  if (!entry)
    return showError(window, t('pleaseSelectEntryToEdit'), {
      title: 'Entry Not Selected'
    });
  const password = await getPassword({ entry, window });
  if (password === null)
    return navigator.replace({
      from: (pages) => [pages.PINTENTRY, pages.TOUCH],
      to: (pages) => pages.DB_INDEX
    });
  const newEntry = await requestEntry(password, entry);
  navigator.replace({
    from: (pages) => pages.ENTRY,
    to: (pages) => pages.DB_INDEX
  });
  if (!newEntry) return;
  const db = unlockedDbIndex()!;
  const index = db.secrets.indexOf(entry);
  db.secrets[index] = newEntry;
  setUnlockedDbIndex({ ...db });
  const path = selectedDbPath();
  saveDatabase({ db, path });
}

async function deleteEntry(window: Window) {
  const entry = selectedEntry();
  if (!entry)
    return showError(window, t('pleaseSelectEntryToDelete'), {
      title: 'Entry Not Selected'
    });
  const db = unlockedDbIndex()!;
  const index = db.secrets.indexOf(entry);
  if (index === -1)
    return showError(window, t('cannotDeleteEntryDoesNotExist'), {
      title: 'Entry Not Selected'
    });
  const msgBox = MessageBox.create();
  msgBox.setTitle(t('deleteEntry'));
  msgBox.setText(`${t('areYouSureDeleteEntry')} ${entry.title}?`);
  msgBox.setType('warning');
  msgBox.addButton(t('delete'), 1);
  msgBox.addButton(t('cancel'), -1);
  if (msgBox.runForWindow(window) !== -1) {
    db.secrets.splice(index, 1);
    setUnlockedDbIndex({ ...db });
    const path = selectedDbPath();
    saveDatabase({ db, path });
  }
}

function copyUsername() {
  const entry = selectedEntry();
  if (entry) Clipboard.get().setText(entry?.username);
}

async function copyPassword(window: Window) {
  const entry = selectedEntry();
  if (entry) {
    const password = await getPassword({ entry, window });
    navigator.replace({
      from: (pages) => [pages.PINTENTRY, pages.TOUCH],
      to: (pages) => pages.DB_INDEX
    });
    if (password) {
      Clipboard.get().setText(password);
      triggerClipboardCleanup();
    }
  }
}

async function showQrCode(window: Window) {
  const entry = selectedEntry();
  if (entry) {
    const password = await getPassword({ entry, window });
    navigator.replace({
      from: (pages) => [pages.PINTENTRY, pages.TOUCH],
      to: (pages) => pages.DB_INDEX
    });
    if (password) {
      const code = await qrCodeToString(password);
      const window = QrCodeWindow({ title: `${entry.title} - Password` });
      render(() => QRCode({ code, window }), window);
      window.fitSize();
      window.activate();
    }
  }
}

function copyUrl() {
  const entry = selectedEntry();
  if (entry) Clipboard.get().setText(entry?.url);
}

let clipboardTimeout: NodeJS.Timeout | null = null;
let secondsSinceInactive = 0;

function refreshDbLock() {
  const isMinimised = MainWindow().isMinimized() || false;
  const isActive = MainWindow().isActive() || false;

  if (!isActive && unlockedDbIndex() !== null) secondsSinceInactive++;
  else secondsSinceInactive = 0;

  if (isMinimised && appSettings().dbMinimiseLock) {
    setUnlockedDbIndex(null);
    setSelectedDbPath('');
    navigator.replace({ to: (pages) => pages.WELCOME });
  }

  if (
    !isActive &&
    appSettings().dbTimeout !== null &&
    secondsSinceInactive >= appSettings().dbTimeout!
  ) {
    setUnlockedDbIndex(null);
    setSelectedDbPath('');
    navigator.replace({ to: (pages) => pages.WELCOME });
  }
}

setInterval(refreshDbLock, 1000);

function triggerClipboardCleanup() {
  if (clipboardTimeout) {
    clearTimeout(clipboardTimeout);
    clipboardTimeout = null;
  }
  if (appSettings().clipboardTimout !== null && clipboardTimeout === null) {
    const pw = Clipboard.get().getText();
    clipboardTimeout = setTimeout(() => {
      if (pw === Clipboard.get().getText()) Clipboard.get().clear();
    }, appSettings().clipboardTimout! * 1000);
  }
}

export {
  addNewEntry,
  copyPassword,
  copyUrl,
  copyUsername,
  deleteEntry,
  editEntry,
  getPassword,
  openDatabase,
  refreshDbLock,
  saveNewDatabase,
  showQrCode
};
