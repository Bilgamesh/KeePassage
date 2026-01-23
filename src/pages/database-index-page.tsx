import { SimpleTableModel, Window } from 'gui';
import { setTimeout } from 'timers/promises';

import { DatabaseColumns } from '@/components/database-columns';
import { DatabaseIndexContextMenu } from '@/components/database-index-context-menu';
import { PreviewPanel } from '@/components/preview-panel';
import { editEntry } from '@/data/db-orchestrator';
import {
  appSettings,
  filter,
  selectedEntry,
  setSelectedEntry,
  unlockedDbIndex
} from '@/data/shared-state';
import { Entry } from '@/schemas/database-schema';
import { Show } from 'solid-js';

function DatabaseIndexPage(props: { window: Window }) {
  const sorter = (a: Entry, b: Entry) => a.title.localeCompare(b.title);
  const entries = () => (unlockedDbIndex()?.secrets || []).filter(filter().run).sort(sorter);
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
      <Show when={DatabaseColumns()} keyed>
        <table
          columnsWithOptions={DatabaseColumns()}
          style={{ flex: 1, margin: 20 }}
          hasBorder={true}
          model={model()}
          onRowActivate={() => {
            editEntry(props.window);
          }}
          onSelectionChange={async (self) => {
            await setTimeout(2);
            const index = self.getSelectedRow();
            setSelectedEntry(entries()[index] || null);
          }}
          onMouseDown={async (self, event) => {
            if (event.button === 2) {
              await setTimeout(10);
              DatabaseIndexContextMenu({ window: props.window }).popup();
            }
          }}
        />
      </Show>
      <PreviewPanel
        window={props.window}
        visible={appSettings().showPreview && selectedEntry() !== null}
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
      />
    </container>
  );
}

export { DatabaseIndexPage };
