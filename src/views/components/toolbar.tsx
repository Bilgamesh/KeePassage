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
import {
  DARK_MODE_FONT_COLOR,
  DATABASE_EXTENSION,
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
import * as navigator from '#/data/navigator';
import {
  appSettings,
  isDark,
  selectedEntry,
  setFilter,
  setSelectedDbPath,
  setUnlockedDbIndex,
  unlockedDbIndex
} from '#/data/shared-state';
import { IconButton } from '#/views/components/icon-button';
import { Image } from '#/views/components/image';
import { openPasswordGenerator } from '#/views/pages/pw-generator-page';
import { openSettingsPage } from '#/views/pages/settings-page';

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
      navigator.isCurrentPage((pages) => pages.DB_INDEX) &&
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
            navigator.isCurrentPage((pages) => pages.WELCOME) ||
            navigator.isCurrentPage((pages) => pages.DB_INDEX)
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
            navigator.isCurrentPage((pages) => pages.DB_INDEX)
          }
          onClick={() => {
            setUnlockedDbIndex(null);
            setSelectedDbPath('');
            navigator.replace((pages) => pages.WELCOME);
          }}
          src={lockIcon}
          tooltip={t('lockDb')}
        />
        <vseparator
          style={{ 'margin-left': 10, 'margin-top': 5, 'margin-bottom': 5 }}
        />
        <IconButton
          enabled={navigator.isCurrentPage((pages) => pages.DB_INDEX)}
          onClick={() => {
            addNewEntry();
          }}
          src={plusIcon}
          tooltip={t('newEntry...')}
        />
        <IconButton
          enabled={
            navigator.isCurrentPage((pages) => pages.DB_INDEX) &&
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
            navigator.isCurrentPage((pages) => pages.DB_INDEX) &&
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
            navigator.isCurrentPage((pages) => pages.DB_INDEX) &&
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
            navigator.isCurrentPage((pages) => pages.DB_INDEX) &&
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
            navigator.isCurrentPage((pages) => pages.DB_INDEX) &&
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
            navigator.isCurrentPage((pages) => pages.DB_INDEX) &&
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
            navigator.isCurrentPage((pages) => pages.WELCOME) ||
            navigator.isCurrentPage((pages) => pages.DB_INDEX)
          }
          onClick={() => {
            openPasswordGenerator();
          }}
          src={diceIcon}
          tooltip={t('passwordGenerator')}
        />
        <IconButton
          enabled={
            navigator.isCurrentPage((pages) => pages.WELCOME) ||
            navigator.isCurrentPage((pages) => pages.DB_INDEX)
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
          enabled={navigator.isCurrentPage((pages) => pages.DB_INDEX)}
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
              if (navigator.isCurrentPage((pages) => pages.WELCOME)) {
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
