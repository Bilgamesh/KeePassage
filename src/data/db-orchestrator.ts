import { Clipboard, FileSaveDialog, MessageBox, type Window } from 'gui';
import type { Accessor } from 'solid-js';
import { DATABASE_EXTENSION } from '#/data/constants';
import { t } from '#/data/i18n';
import * as navigator from '#/data/navigator';
import {
  appSettings,
  selectedDbPath,
  selectedEntry,
  setSelectedDbPath,
  setUnlockedDbIndex,
  unlockedDbIndex
} from '#/data/shared-state';
import type { Entry } from '#/schemas/database-schema';
import type { YubiKey } from '#/schemas/yubikey-schema';
import { updateSettings } from '#/service/config-service';
import {
  addDatabase,
  getMatchingKey,
  loadDatabase,
  saveDatabase,
  unlockDatabase
} from '#/service/database-service';
import { decrypt } from '#/service/pcsc-service';
import { showError } from '#/utils/message-box-util';
import { showQrCodeWindow } from '#/utils/qr-code-util';
import { requestEntry } from '#/views/pages/entry-page';
import { requestPin } from '#/views/pages/pinentry-page';
import { requestTouch } from '#/views/pages/touch-page';
import { getMainWindow } from '#/windows/main-window';

async function openDatabase(window: Window, path: string) {
  const previousPath = selectedDbPath();
  setSelectedDbPath(path);
  const dbFile = await loadDatabase(path);
  const key = await getMatchingKey(dbFile, 1000);
  if (!key) {
    showError(
      window,
      `Please connect the correct YubiKey with one of the following serial numbers:\n${dbFile.s.map((s) => s.serial).join(', ')}`,
      {
        title: 'YubiKey Not Connected'
      }
    );
    return;
  }
  const pin = await requestPin(key.serial);
  if (!pin) {
    setSelectedDbPath(previousPath);
    navigator.pop();
    return;
  }
  try {
    const signal = requestTouch();
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
    if (!(err instanceof DOMException) || err.name !== 'AbortError') {
      showError(window, err);
    }
    setSelectedDbPath(previousPath);
    navigator.replace({
      from: (pages) => [pages.TOUCH, pages.PINTENTRY],
      to: (pages) => pages.WELCOME
    });
  }
  await updateSettings((settings) => {
    const index = settings.recent.indexOf(path);
    if (index === -1) {
      settings.recent.unshift(path);
    } else {
      settings.recent.unshift(settings.recent.splice(index, 1)[0]!);
    }
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
    if (msgBox.runForWindow(window) !== 1) {
      return;
    }
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
      if (index !== -1) {
        settings.recent.splice(index, 1);
      }
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
  const pin = await requestPin(key.serial, entry.title);
  if (!pin) {
    navigator.replace({
      from: (pages) => [pages.TOUCH, pages.PINTENTRY],
      to: (pages) => pages.DB_INDEX
    });
    return null;
  }
  try {
    const signal = requestTouch();
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
    if (!(err instanceof DOMException) || err.name !== 'AbortError') {
      showError(window, err);
    }
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
  if (!entry) {
    showError(window, t('pleaseSelectEntryToEdit'), {
      title: 'Entry Not Selected'
    });
    return;
  }
  const password = await getPassword({ entry, window });
  if (password === null) {
    navigator.replace({
      from: (pages) => [pages.PINTENTRY, pages.TOUCH],
      to: (pages) => pages.DB_INDEX
    });
    return;
  }
  const newEntry = await requestEntry(password, entry);
  navigator.replace({
    from: (pages) => pages.ENTRY,
    to: (pages) => pages.DB_INDEX
  });
  if (!newEntry) {
    return;
  }
  const db = unlockedDbIndex()!;
  const index = db.secrets.indexOf(entry);
  db.secrets[index] = newEntry;
  setUnlockedDbIndex({ ...db });
  const path = selectedDbPath();
  saveDatabase({ db, path });
}

async function deleteEntry(window: Window) {
  const entry = selectedEntry();
  if (!entry) {
    showError(window, t('pleaseSelectEntryToDelete'), {
      title: 'Entry Not Selected'
    });
    return;
  }
  const db = unlockedDbIndex()!;
  const index = db.secrets.indexOf(entry);
  if (index === -1) {
    showError(window, t('cannotDeleteEntryDoesNotExist'), {
      title: 'Entry Not Selected'
    });
    return;
  }
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
  if (entry) {
    Clipboard.get().setText(entry?.username);
  }
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
      showQrCodeWindow(`${entry.title} - Password`, password);
    }
  }
}

function copyUrl() {
  const entry = selectedEntry();
  if (entry) {
    Clipboard.get().setText(entry?.url);
  }
}

let clipboardTimeout: NodeJS.Timeout | null = null;
let secondsSinceInactive = 0;

function refreshDbLock() {
  const isMinimised = getMainWindow()?.isMinimized() || false;
  const isActive = getMainWindow()?.isActive() || false;

  if (!isActive && unlockedDbIndex() !== null) {
    secondsSinceInactive++;
  } else {
    secondsSinceInactive = 0;
  }

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
      if (pw === Clipboard.get().getText()) {
        Clipboard.get().clear();
      }
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
