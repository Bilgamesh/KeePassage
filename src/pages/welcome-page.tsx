import { Expand } from '@/components/expand';
import { Image } from '@/components/image';
import { APP_NAME, DATABASE_EXTENSION, VERSION } from '@/data/constants';
import { openDatabase } from '@/data/db-orchestrator';
import { appSettings } from '@/data/shared-state';
import { DatabaseCreationPage } from '@/pages/database-creation-page';
import { render } from '@/renderer';
import { LargeButton, TitleFont } from '@/styles';
import { getDatabaseWindow, hasDatabaseWindow } from '@/windows/database-window';
import { AttributedText, FileOpenDialog, SimpleTableModel, type Window } from 'gui';
import { createEffect, createSignal } from 'solid-js';

function WelcomePage(props: { window: Window }) {
  const [dbTable, setDbTable] = createSignal(SimpleTableModel.create(1));

  const recent = () => appSettings().recent;

  createEffect(() => {
    const table = SimpleTableModel.create(1);
    for (const db of recent()) {
      table.addRow([db]);
    }
    setDbTable(table);
  });

  return (
    <container style={{ flex: 1, flexDirection: 'column' }}>
      <Expand />
      <Image
        src={['img', 'logo.ico']}
        size={{ height: 50, width: 50 }}
        scale={2}
        style={{ 'margin-bottom': 20 }}
      />
      <label
        attributedText={AttributedText.create(`WelcomePage to ${APP_NAME} ${VERSION}`, {
          align: 'center',
          font: TitleFont
        })}
      />
      <label
        visible={!recent().length}
        text="Start storing your password in a YubiKey-encrypted KeePassage database"
      />
      <container style={{ flexDirection: 'row', 'margin-top': 20 }}>
        <Expand />
        <button
          title="+ Create Database"
          style={LargeButton}
          onClick={() => {
            const win = getDatabaseWindow();
            render(() => <DatabaseCreationPage window={win} mainWindow={props.window} />, win);
            win.activate();
          }}
        />
        <button
          title="Open Database"
          style={{ ...LargeButton, 'margin-left': 10 }}
          onClick={async () => {
            if (hasDatabaseWindow()) {
              getDatabaseWindow().activate();
              return;
            }
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
        <button enabled={false} title="Import File" style={{ ...LargeButton, 'margin-left': 10 }} />
        <Expand />
      </container>
      <container visible={recent().length > 0} style={{ flex: 1, flexDirection: 'row' }}>
        <Expand direction="row" />
        <container style={{ flexDirection: 'column', width: 440 }}>
          <label
            text="Recent databases"
            align="start"
            style={{ 'margin-top': 20, 'margin-bottom': 5 }}
          />
          <table
            columnsWithOptions={[
              {
                label: 'Recent databases',
                options: {
                  type: 'text'
                }
              }
            ]}
            columnsVisible={false}
            style={{ flex: 4 }}
            hasBorder={true}
            model={dbTable()}
            onRowActivate={async (table, row) => {
              if (hasDatabaseWindow()) {
                getDatabaseWindow().activate();
                return;
              }
              const path = recent()[row]!;
              openDatabase(props.window, path);
            }}
          />
        </container>
        <Expand direction="row" />
      </container>
      <Expand />
    </container>
  );
}

export { WelcomePage };
