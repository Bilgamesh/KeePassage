import {
  AttributedText,
  FileOpenDialog,
  SimpleTableModel,
  type Window
} from 'gui';
import { createEffect, createSignal } from 'solid-js';
import logoImage from '#/assets/img/logo.ico';
import { Expand } from '#/components/expand';
import { Image } from '#/components/image';
import {
  APP_NAME,
  DATABASE_EXTENSION,
  LARGE_BUTTON_STYLE,
  TITLE_FONT,
  VERSION
} from '#/data/constants';
import { openDatabase } from '#/data/db-orchestrator';
import { t } from '#/data/i18n';
import { appSettings } from '#/data/shared-state';
import { DatabaseCreationPage } from '#/pages/database-creation-page';
import { render } from '#/renderer';
import {
  getDatabaseWindow,
  hasDatabaseWindow
} from '#/windows/database-window';

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
        src={logoImage}
        size={{ height: 50, width: 50 }}
        scale={2}
        style={{ 'margin-bottom': 20 }}
      />
      <label
        attributedText={AttributedText.create(
          `${t('welcomeTo')} ${APP_NAME} ${VERSION}`,
          {
            align: 'center',
            font: TITLE_FONT
          }
        )}
      />
      <label visible={!recent().length} text={t('startStoring')} />
      <container style={{ flexDirection: 'row', 'margin-top': 20 }}>
        <Expand />
        <button
          title={`+ ${t('createDatabase')}`}
          style={LARGE_BUTTON_STYLE}
          onClick={() => {
            const win = getDatabaseWindow();
            render(
              () => (
                <DatabaseCreationPage window={win} mainWindow={props.window} />
              ),
              win
            );
            win.activate();
          }}
        />
        <button
          title={t('openDb')}
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
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
        <button
          enabled={false}
          title={t('importFile')}
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
        />
        <Expand />
      </container>
      <container
        visible={recent().length > 0}
        style={{ flex: 1, flexDirection: 'row' }}
      >
        <Expand direction="row" />
        <container style={{ flexDirection: 'column', width: 440 }}>
          <label
            text={t('recentDatabases')}
            align="start"
            style={{ 'margin-top': 20, 'margin-bottom': 5 }}
          />
          <table
            columnsWithOptions={[
              {
                label: '',
                options: {
                  type: 'text'
                }
              }
            ]}
            columnsVisible={false}
            style={{ flex: 4 }}
            hasBorder={true}
            model={dbTable()}
            onRowActivate={async (_table, row) => {
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
