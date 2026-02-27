import {
  type Entry,
  Event,
  FileOpenDialog,
  type KeyEvent,
  type Window
} from 'gui';
import { createEffect } from 'solid-js';
import copyIcon from '#/assets/icons/copy.png';
import diceIcon from '#/assets/icons/dice-3.png';
import editIcon from '#/assets/icons/edit.png';
import folderIcon from '#/assets/icons/folder.png';
import linkIcon from '#/assets/icons/link.png';
import lockIcon from '#/assets/icons/lock.png';
import userIcon from '#/assets/icons/person.png';
import qrcodeIcon from '#/assets/icons/qrcode.png';
import searchIcon from '#/assets/icons/search.png';
import settingsIcon from '#/assets/icons/settings.png';
import plusIcon from '#/assets/icons/square-plus.png';
import trashIcon from '#/assets/icons/trash.png';
import { IconButton } from '#/components/icon-button';
import { Image } from '#/components/image';
import {
  DARK_MODE_FONT_COLOR,
  DATABASE_EXTENSION,
  PAGE_INDEXES,
  SMALL_ENTRY_STYLE
} from '#/data/constants';
import {
  addNewEntry,
  copyPassword,
  copyUrl,
  copyUsername,
  deleteEntry,
  editEntry,
  openDatabase,
  showQrCode
} from '#/data/db-orchestrator';
import { t } from '#/data/i18n';
import {
  appSettings,
  isDark,
  mainPageIndex,
  selectedEntry,
  setFilter,
  setMainPageIndex,
  setSelectedDbPath,
  setUnlockedDbIndex,
  unlockedDbIndex
} from '#/data/shared-state';
import { openPasswordGenerator } from '#/pages/pw-generator-page';
import { openSettingsPage } from '#/pages/settings-page';

function Toolbar(props: { window: Window }) {
  function updateFilter(text: string) {
    text = text.toLowerCase();
    setFilter({
      run: (entry) => {
        return (
          text === '' ||
          entry.title.toLowerCase().includes(text) ||
          entry.username.toLowerCase().includes(text) ||
          entry.tags.toLowerCase().includes(text) ||
          entry.url.toLowerCase().includes(text)
        );
      }
    });
  }
  let searchBar: Entry;

  props.window.onKeyDown.connect((_self: Window, ev: KeyEvent) => {
    const ctrlOrCmd =
      process.platform === 'darwin'
        ? Event.isMetaPressed()
        : Event.isControlPressed();
    if (
      appSettings().showToolbar &&
      mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
      ctrlOrCmd &&
      ev.key === 'f'
    ) {
      searchBar.focus();
    }
  });

  return (
    <>
      <container
        style={{ flexDirection: 'row', height: 50 }}
        visible={appSettings().showToolbar}
        {...(process.platform === 'win32'
          ? { backgroundColor: '#FFFFFF' }
          : {})}
      >
        <IconButton
          enabled={
            mainPageIndex() === PAGE_INDEXES.WELCOME ||
            mainPageIndex() === PAGE_INDEXES.DB_INDEX
          }
          onClick={() => {
            const dialog = FileOpenDialog.create();
            dialog.setFilters([
              {
                description: 'KeePassage Database',
                extensions: [DATABASE_EXTENSION]
              }
            ]);
            if (dialog.runForWindow(props.window)) {
              const path = dialog.getResult();
              openDatabase(props.window, path);
            }
          }}
          src={folderIcon}
          tooltip={t('openDb...')}
        />
        <IconButton
          enabled={
            unlockedDbIndex() !== null &&
            mainPageIndex() === PAGE_INDEXES.DB_INDEX
          }
          onClick={() => {
            setUnlockedDbIndex(null);
            setSelectedDbPath('');
            setMainPageIndex(PAGE_INDEXES.WELCOME);
          }}
          src={lockIcon}
          tooltip={t('lockDb')}
        />
        <vseparator
          style={{ 'margin-left': 10, 'margin-top': 5, 'margin-bottom': 5 }}
        />
        <IconButton
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX}
          onClick={() => {
            addNewEntry();
          }}
          src={plusIcon}
          tooltip={t('newEntry...')}
        />
        <IconButton
          enabled={
            mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
            selectedEntry() !== null
          }
          onClick={() => {
            editEntry(props.window);
          }}
          src={editIcon}
          tooltip={t('editEntry')}
        />
        <IconButton
          enabled={
            mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
            selectedEntry() !== null
          }
          onClick={() => {
            deleteEntry(props.window);
          }}
          src={trashIcon}
          tooltip={t('deleteEntry')}
        />
        <vseparator
          style={{ 'margin-left': 10, 'margin-top': 5, 'margin-bottom': 5 }}
        />
        <IconButton
          enabled={
            mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
            selectedEntry() !== null
          }
          onClick={() => {
            copyUsername();
          }}
          src={userIcon}
          tooltip={t('copyUsername')}
        />
        <IconButton
          enabled={
            mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
            selectedEntry() !== null
          }
          onClick={() => {
            copyPassword(props.window);
          }}
          src={copyIcon}
          tooltip={t('copyPassword')}
        />
        <IconButton
          enabled={
            mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
            selectedEntry() !== null
          }
          onClick={() => {
            showQrCode(props.window);
          }}
          src={qrcodeIcon}
          tooltip={t('showQrCode')}
        />
        <IconButton
          enabled={
            mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
            selectedEntry() !== null
          }
          onClick={() => {
            copyUrl();
          }}
          src={linkIcon}
          tooltip={t('copyUrl')}
        />
        <vseparator
          style={{ 'margin-left': 10, 'margin-top': 5, 'margin-bottom': 5 }}
        />
        <IconButton
          enabled={
            mainPageIndex() === PAGE_INDEXES.WELCOME ||
            mainPageIndex() === PAGE_INDEXES.DB_INDEX
          }
          onClick={() => {
            openPasswordGenerator();
          }}
          src={diceIcon}
          tooltip={t('passwordGenerator')}
        />
        <IconButton
          enabled={
            mainPageIndex() === PAGE_INDEXES.WELCOME ||
            mainPageIndex() === PAGE_INDEXES.DB_INDEX
          }
          onClick={() => {
            openSettingsPage();
          }}
          src={settingsIcon}
          tooltip={t('settings')}
        />
        <vseparator
          style={{ 'margin-left': 10, 'margin-top': 5, 'margin-bottom': 5 }}
        />
        <Image
          scale={2}
          size={{ height: 15, width: 15 }}
          src={searchIcon}
          style={{ 'margin-left': 5 }}
          {...(process.platform === 'linux' && isDark()
            ? { tint: DARK_MODE_FONT_COLOR }
            : {})}
        />
        <entry
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX}
          onKeyDown={(self, ev) => {
            if (ev.key === 'Enter') {
              return true;
            }
            if (ev.key === 'Backspace' && self.getText() === '') {
              return true;
            }
            return false;
          }}
          onTextChange={(self) => {
            const text = self.getText().trim();
            updateFilter(text);
          }}
          ref={({ node }) => {
            searchBar = node;
            createEffect(() => {
              if (!appSettings().showToolbar) {
                node.setText('');
                updateFilter('');
              }
              if (mainPageIndex() === PAGE_INDEXES.WELCOME) {
                node.setText('');
                updateFilter('');
              }
            });
          }}
          style={{
            flex: 1,
            'margin-left': 2,
            'margin-right': 20,
            'margin-top': 14,
            ...SMALL_ENTRY_STYLE
          }}
        />
      </container>
      <hseparator visible={appSettings().showToolbar} />
    </>
  );
}

export { Toolbar };
