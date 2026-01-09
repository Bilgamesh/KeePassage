import { DatabaseIndexContextMenu } from '@/components/database-index-context-menu';
import { PreviewPanel } from '@/components/preview-panel';
import { DATABASE_COLUMNS } from '@/data/constants';
import { editEntry } from '@/data/db-orchestrator';
import {
  appSettings,
  filter,
  selectedEntry,
  setSelectedEntry,
  unlockedDbIndex
} from '@/data/shared-state';
import { sleep } from '@/utils/time-util';
import { SimpleTableModel, Window } from 'gui';

function DatabaseIndexPage(props: { window: Window }) {
  const model = () => {
    const tableModel = SimpleTableModel.create(5);
    const index = unlockedDbIndex();
    const secrets = (index?.secrets || []).filter(filter().run);
    for (const entry of secrets) {
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
      <table
        columnsWithOptions={DATABASE_COLUMNS}
        style={{ flex: 1, margin: 20 }}
        hasBorder={true}
        model={model()}
        onRowActivate={() => {
          editEntry(props.window);
        }}
        onSelectionChange={async (self) => {
          await sleep(2);
          const index = self.getSelectedRow();
          const entries = (unlockedDbIndex()?.secrets || []).filter(filter().run);
          setSelectedEntry(entries[index] || null);
        }}
        onMouseDown={async (self, event) => {
          if (event.button === 2) {
            await sleep(10);
            DatabaseIndexContextMenu({ window: props.window }).popup();
          }
        }}
      />
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
