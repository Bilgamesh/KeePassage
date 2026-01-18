import { Entry, Event, FileOpenDialog, KeyEvent, Window } from 'gui';
import { createEffect } from 'solid-js';

import { IconButton } from '@/components/icon-button';
import { Image } from '@/components/image';
import {
  DARK_MODE_FONT_COLOR,
  DATABASE_EXTENSION,
  PAGE_INDEXES,
  SMALL_ENTRY_STYLE
} from '@/data/constants';
import {
  addNewEntry,
  copyPassword,
  copyUrl,
  copyUsername,
  deleteEntry,
  editEntry,
  openDatabase,
  showQrCode
} from '@/data/db-orchestrator';
import { t } from '@/data/i18n';
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
} from '@/data/shared-state';
import { openPasswordGenerator } from '@/pages/pw-generator-page';
import { openSettingsPage } from '@/pages/settings-page';

import copyIcon from '@/assets/icons/copy.png';
import diceIcon from '@/assets/icons/dice-3.png';
import editIcon from '@/assets/icons/edit.png';
import folderIcon from '@/assets/icons/folder.png';
import linkIcon from '@/assets/icons/link.png';
import lockIcon from '@/assets/icons/lock.png';
import userIcon from '@/assets/icons/person.png';
import qrcodeIcon from '@/assets/icons/qrcode.png';
import searchIcon from '@/assets/icons/search.png';
import settingsIcon from '@/assets/icons/settings.png';
import plusIcon from '@/assets/icons/square-plus.png';
import trashIcon from '@/assets/icons/trash.png';

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

  props.window.onKeyDown.connect((self: Window, ev: KeyEvent) => {
    const ctrlOrCmd =
      process.platform === 'darwin' ? Event.isMetaPressed() : Event.isControlPressed();
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
        visible={appSettings().showToolbar}
        style={{ flexDirection: 'row', height: 50 }}
        {...(process.platform === 'win32' ? { backgroundColor: '#FFFFFF' } : {})}
      >
        <IconButton
          tooltip={t('openDb...')}
          src={folderIcon}
          enabled={
            mainPageIndex() === PAGE_INDEXES.WELCOME || mainPageIndex() === PAGE_INDEXES.DB_INDEX
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
        />
        <IconButton
          tooltip={t('lockDb')}
          src={lockIcon}
          enabled={unlockedDbIndex() !== null && mainPageIndex() === PAGE_INDEXES.DB_INDEX}
          onClick={() => {
            setUnlockedDbIndex(null);
            setSelectedDbPath('');
            setMainPageIndex(PAGE_INDEXES.WELCOME);
          }}
        />
        <vseparator style={{ 'margin-left': 10, 'margin-top': 5, 'margin-bottom': 5 }} />
        <IconButton
          tooltip={t('newEntry...')}
          src={plusIcon}
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX}
          onClick={() => {
            addNewEntry();
          }}
        />
        <IconButton
          tooltip={t('editEntry')}
          src={editIcon}
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null}
          onClick={() => {
            editEntry(props.window);
          }}
        />
        <IconButton
          tooltip={t('deleteEntry')}
          src={trashIcon}
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null}
          onClick={() => {
            deleteEntry(props.window);
          }}
        />
        <vseparator style={{ 'margin-left': 10, 'margin-top': 5, 'margin-bottom': 5 }} />
        <IconButton
          tooltip={t('copyUsername')}
          src={userIcon}
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null}
          onClick={() => {
            copyUsername();
          }}
        />
        <IconButton
          tooltip={t('copyPassword')}
          src={copyIcon}
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null}
          onClick={() => {
            copyPassword(props.window);
          }}
        />
        <IconButton
          tooltip={t('showQrCode')}
          src={qrcodeIcon}
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null}
          onClick={() => {
            showQrCode(props.window);
          }}
        />
        <IconButton
          tooltip={t('copyUrl')}
          src={linkIcon}
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null}
          onClick={() => {
            copyUrl();
          }}
        />
        <vseparator style={{ 'margin-left': 10, 'margin-top': 5, 'margin-bottom': 5 }} />
        <IconButton
          tooltip={t('passwordGenerator')}
          src={diceIcon}
          enabled={
            mainPageIndex() === PAGE_INDEXES.WELCOME || mainPageIndex() === PAGE_INDEXES.DB_INDEX
          }
          onClick={() => {
            openPasswordGenerator();
          }}
        />
        <IconButton
          tooltip={t('settings')}
          src={settingsIcon}
          enabled={
            mainPageIndex() === PAGE_INDEXES.WELCOME || mainPageIndex() === PAGE_INDEXES.DB_INDEX
          }
          onClick={() => {
            openSettingsPage();
          }}
        />
        <vseparator style={{ 'margin-left': 10, 'margin-top': 5, 'margin-bottom': 5 }} />
        <Image
          size={{ height: 15, width: 15 }}
          src={searchIcon}
          style={{ 'margin-left': 5 }}
          scale={2}
          {...(process.platform === 'linux' && isDark() ? { tint: DARK_MODE_FONT_COLOR } : {})}
        />
        <entry
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX}
          style={{
            flex: 1,
            'margin-left': 2,
            'margin-right': 20,
            'margin-top': 14,
            ...SMALL_ENTRY_STYLE
          }}
          onKeyDown={(self, ev) => {
            if (ev.key === 'Enter') {
              return true;
            }
            if (ev.key === 'Backspace' && self.getText() === '') {
              return true;
            }
            return false;
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
          onTextChange={(self) => {
            const text = self.getText().trim();
            updateFilter(text);
          }}
        />
      </container>
      <hseparator visible={appSettings().showToolbar} />
    </>
  );
}

export { Toolbar };
