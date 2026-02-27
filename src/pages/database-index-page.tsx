import { setTimeout } from 'node:timers/promises';
import { SimpleTableModel, type Window } from 'gui';
import { Show } from 'solid-js';
import { DatabaseColumns } from '#/components/database-columns';
import { DatabaseIndexContextMenu } from '#/components/database-index-context-menu';
import { PreviewPanel } from '#/components/preview-panel';
import { editEntry } from '#/data/db-orchestrator';
import {
  appSettings,
  filter,
  selectedEntry,
  setSelectedEntry,
  unlockedDbIndex
} from '#/data/shared-state';
import type { Entry } from '#/schemas/database-schema';

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
      <Show keyed when={DatabaseColumns()}>
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
