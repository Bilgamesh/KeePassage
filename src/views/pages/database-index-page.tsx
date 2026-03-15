import { setTimeout } from 'node:timers/promises';
import { SimpleTableModel, type Window } from 'gui';
import { For, Show } from 'solid-js';
import { editEntry } from '#/data/db-orchestrator';
import { currentDictionary, dictionaries } from '#/data/i18n';
import {
  appSettings,
  filter,
  selectedEntry,
  setSelectedEntry,
  unlockedDbIndex
} from '#/data/shared-state';
import type { Entry } from '#/schemas/database-schema';
import { DatabaseColumns } from '#/views/components/database-columns';
import { DatabaseIndexContextMenu } from '#/views/components/database-index-context-menu';
import { PreviewPanel } from '#/views/components/preview-panel';

function DatabaseIndexPage(props: { window: Window }) {
  const sorter = (a: Entry, b: Entry) => a.title.localeCompare(b.title);
  const entries = () =>
    (unlockedDbIndex()?.secrets || []).filter(filter().run).sort(sorter);
  const model = () => {
    const tableModel = SimpleTableModel.create(5);
    for (const entry of entries()) {
      const displayedUserName = appSettings().hideUserNames
        ? entry.username.replaceAll(/./g, '*')
        : entry.username;
      tableModel.addRow([
        entry.title,
        displayedUserName,
        entry.url,
        entry.notes,
        new Date(entry.modified).toLocaleString()
      ]);
    }
    return tableModel;
  };

  return (
    <container style={{ flex: 1 }}>
      <For each={dictionaries}>
        {(dict) => (
          // There is a limitation in Yue - table columns cannot be deleted and their titles can't be modified.
          // Because of that, we have to re-create the table when language is changed, to translate the column titles.
          <Show when={dict === currentDictionary()}>
            <table
              columnsWithOptions={DatabaseColumns()}
              hasBorder={true}
              model={model()}
              onMouseDown={async (_self, event) => {
                if (event.button === 2) {
                  await setTimeout(10);
                  DatabaseIndexContextMenu({ window: props.window }).popup();
                }
              }}
              onMouseUp={async (_self, event) => {
                if (event.button === 2 && process.platform === 'linux') {
                  await setTimeout(10);
                  DatabaseIndexContextMenu({ window: props.window }).popup();
                }
              }}
              onRowActivate={() => {
                editEntry(props.window);
              }}
              onSelectionChange={async (self) => {
                await setTimeout(2);
                const index = self.getSelectedRow();
                setSelectedEntry(entries()[index] || null);
              }}
              style={{ flex: 1, margin: 20 }}
            />
          </Show>
        )}
      </For>
      <PreviewPanel
        entry={
          selectedEntry() || {
            encryptedPayloads: [],
            notes: '',
            tags: '',
            title: '',
            url: '',
            username: '',
            modified: 0
          }
        }
        visible={appSettings().showPreview && selectedEntry() !== null}
        window={props.window}
      />
    </container>
  );
}

export { DatabaseIndexPage };
