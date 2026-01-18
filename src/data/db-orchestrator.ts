import { Clipboard, FileSaveDialog, MessageBox, Window } from 'gui';
import { Accessor } from 'solid-js';

import { DATABASE_EXTENSION, PAGE_INDEXES } from '@/data/constants';
import {
  appSettings,
  mainPageIndex,
  selectedDbPath,
  selectedEntry,
  setMainPageIndex,
  setSelectedDbPath,
  setUnlockedDbIndex,
  unlockedDbIndex
} from '@/data/shared-state';
import { requestEntry } from '@/pages/entry-page';
import { requestPin } from '@/pages/pinentry-page';
import { requestTouch } from '@/pages/touch-page';
import { Entry } from '@/schemas/database-schema';
import { YubiKey } from '@/schemas/yubikey-schema';
import { updateSettings } from '@/service/config-service';
import {
  addDatabase,
  getMatchingKey,
  loadDatabase,
  saveDatabase,
  unlockDatabase
} from '@/service/database-service';
import { decrypt } from '@/service/pcsc-service';
import { showError } from '@/utils/message-box-util';
import { showQrCodeWindow } from '@/utils/qr-code-util';
import { getMainWindow } from '@/windows/main-window';

async function openDatabase(window: Window, path: string) {
  const previousPath = selectedDbPath();
  setSelectedDbPath(path);
  const previousPageIndex = mainPageIndex();
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
    setMainPageIndex(previousPageIndex);
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
    setMainPageIndex(PAGE_INDEXES.DB_INDEX);
  } catch (err) {
    console.error(`Failed to open database: ${err}`);
    if (!(err instanceof DOMException) || err.name !== 'AbortError') {
      showError(window, err);
    }
    setSelectedDbPath(previousPath);
    setMainPageIndex(previousPageIndex);
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
    msgBox.setTitle('Backup required');
    msgBox.setType('warning');
    msgBox.setText(
      'You have only selected 1 key. It is highly recommended to pair at least 2 keys so that one can serve as a backup.'
    );
    msgBox.addButton('Cancel', -1);
    msgBox.addButton('Continue without backup', 1);
    if (msgBox.runForWindow(window) !== 1) {
      return;
    }
  }

  const dialog = FileSaveDialog.create();
  dialog.setFilename(dbName());
  dialog.setFilters([
    {
      description: 'KeePassage Database',
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
      `Please connect the correct YubiKey with one of the following serial numbers:\n${dbFile.s.map((s) => s.serial).join(', ')}`,
      {
        title: 'YubiKey Not Connected'
      }
    );
    return null;
  }
  const pin = await requestPin(key.serial, entry.title);
  if (!pin) {
    setMainPageIndex(PAGE_INDEXES.DB_INDEX);
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
  setMainPageIndex(PAGE_INDEXES.DB_INDEX);
  if (entry) {
    setUnlockedDbIndex((db) => {
      db!.secrets.push(entry);
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
    showError(window, `Please select an entry you would like to edit`, {
      title: 'Entry Not Selected'
    });
    return;
  }
  const password = await getPassword({ entry, window });
  if (password === null) {
    setMainPageIndex(PAGE_INDEXES.DB_INDEX);
    return;
  }
  const newEntry = await requestEntry(password, entry);
  setMainPageIndex(PAGE_INDEXES.DB_INDEX);
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
    showError(window, `Please select an entry you would like to delete`, {
      title: 'Entry Not Selected'
    });
    return;
  }
  const db = unlockedDbIndex()!;
  const index = db.secrets.indexOf(entry);
  if (index === -1) {
    showError(window, `Cannot delete this entry as it does not exist`, {
      title: 'Entry Not Selected'
    });
    return;
  }
  const msgBox = MessageBox.create();
  msgBox.setTitle('Delete Entry');
  msgBox.setText(`Are you sure you want to delete entry ${entry.title}?`);
  msgBox.setType('warning');
  msgBox.addButton('Delete', 1);
  msgBox.addButton('Cancel', -1);
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
    setMainPageIndex(PAGE_INDEXES.DB_INDEX);
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
    setMainPageIndex(PAGE_INDEXES.DB_INDEX);
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
    setMainPageIndex(PAGE_INDEXES.WELCOME);
  }

  if (
    !isActive &&
    appSettings().dbTimeout !== null &&
    secondsSinceInactive >= appSettings().dbTimeout!
  ) {
    setUnlockedDbIndex(null);
    setSelectedDbPath('');
    setMainPageIndex(PAGE_INDEXES.WELCOME);
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
