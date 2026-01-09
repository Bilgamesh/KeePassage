import { IconButton } from '@/components/icon-button';
import { Image } from '@/components/image';
import { DATABASE_EXTENSION, PAGE_INDEXES } from '@/data/constants';
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
import {
  appSettings,
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
import { SmallEntry } from '@/styles';
import { Entry, Event, FileOpenDialog, KeyEvent, Window } from 'gui';
import { createEffect } from 'solid-js';

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
          tooltip="Open database"
          icon="folder.png"
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
          tooltip="Lock database"
          icon="lock.png"
          enabled={unlockedDbIndex() !== null && mainPageIndex() === PAGE_INDEXES.DB_INDEX}
          onClick={() => {
            setUnlockedDbIndex(null);
            setSelectedDbPath('');
            setMainPageIndex(PAGE_INDEXES.WELCOME);
          }}
        />
        <vseparator style={{ 'margin-left': 10, 'margin-top': 5, 'margin-bottom': 5 }} />
        <IconButton
          tooltip="Add new entry"
          icon="square-plus.png"
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX}
          onClick={() => {
            addNewEntry();
          }}
        />
        <IconButton
          tooltip="Edit selected entry"
          icon="edit.png"
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null}
          onClick={() => {
            editEntry(props.window);
          }}
        />
        <IconButton
          tooltip="Delete selected entry"
          icon="trash.png"
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null}
          onClick={() => {
            deleteEntry(props.window);
          }}
        />
        <vseparator style={{ 'margin-left': 10, 'margin-top': 5, 'margin-bottom': 5 }} />
        <IconButton
          tooltip="Copy selected username"
          icon="user.png"
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null}
          onClick={() => {
            copyUsername();
          }}
        />
        <IconButton
          tooltip="Copy selected password"
          icon="copy.png"
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null}
          onClick={() => {
            copyPassword(props.window);
          }}
        />
        <IconButton
          tooltip="Generate QR code with password"
          icon="qrcode.png"
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null}
          onClick={() => {
            showQrCode(props.window);
          }}
        />
        <IconButton
          tooltip="Copy selected URL"
          icon="link.png"
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null}
          onClick={() => {
            copyUrl();
          }}
        />
        <vseparator style={{ 'margin-left': 10, 'margin-top': 5, 'margin-bottom': 5 }} />
        <IconButton
          tooltip="Password generator"
          icon="dice-3.png"
          enabled={
            mainPageIndex() === PAGE_INDEXES.WELCOME || mainPageIndex() === PAGE_INDEXES.DB_INDEX
          }
          onClick={() => {
            openPasswordGenerator();
          }}
        />
        <IconButton
          tooltip="Settings"
          icon="settings.png"
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
          src={['icons', 'search.png']}
          style={{ 'margin-left': 5 }}
          scale={2}
        />
        <entry
          enabled={mainPageIndex() === PAGE_INDEXES.DB_INDEX}
          style={{
            flex: 1,
            'margin-left': 2,
            'margin-right': 20,
            'margin-top': 14,
            ...SmallEntry
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
