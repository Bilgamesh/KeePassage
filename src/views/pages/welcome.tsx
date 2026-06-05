import {
  AttributedText,
  FileOpenDialog,
  SimpleTableModel,
  type Window
} from 'gui';
import { createEffect, createSignal } from 'solid-js';
import logoImage from '#/assets/img/logo.ico';
import {
  APP_NAME,
  DATABASE_EXTENSION,
  LARGE_BUTTON_STYLE,
  TITLE_FONT,
  VERSION
} from '#/data/constants';
import { getTranslator } from '#/data/i18n';
import { AppProvider, useAppContext } from '#/data/shared-state';
import { render } from '#/renderer';
import { openDatabase } from '#/service/database';
import { Expand } from '#/views/components/expand';
import { Image } from '#/views/components/image';
import { DatabaseCreationPage } from '#/views/pages/database-creation';
import { YubiKeyConfigPage } from '#/views/pages/yubikey-config';
import { DatabaseWindow } from '#/views/windows/database';
import { YubiKeyConfigWindow } from '#/views/windows/yubikey-config';

function WelcomePage(props: { window: Window }) {
  const state = useAppContext();
  const t = getTranslator(state);
  const { appSettings } = state;
  const [dbTable, setDbTable] = createSignal(SimpleTableModel.create(1));

  const recent = () => appSettings().recent;

  createEffect(() => {
    const table = SimpleTableModel.create(1);
    for (const db of recent()) table.addRow([db]);
    setDbTable(table);
  });

  return (
    <container style={{ flex: 1, flexDirection: 'column' }}>
      <Expand />
      <Image
        scale={2}
        size={{ height: 50, width: 50 }}
        src={logoImage}
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
      <label text={t('startStoring')} visible={!recent().length} />
      <container style={{ flexDirection: 'row', 'margin-top': 20 }}>
        <Expand />
        <button
          onClick={() => {
            const win = DatabaseWindow(state, true)!;
            render(
              () => (
                <AppProvider>
                  <DatabaseCreationPage
                    mainWindow={props.window}
                    window={win}
                  />
                </AppProvider>
              ),
              win
            );
            win.activate();
          }}
          style={LARGE_BUTTON_STYLE}
          title={`+ ${t('createDatabase')}`}
        />
        <button
          onClick={async () => {
            const win = DatabaseWindow(state);
            if (win) return win.activate();

            const dialog = FileOpenDialog.create();
            dialog.setFilters([
              {
                description: 'KeePassage Database',
                extensions: [DATABASE_EXTENSION]
              }
            ]);
            if (dialog.runForWindow(props.window)) {
              const path = dialog.getResult();
              openDatabase(props.window, path, state);
            }
          }}
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
          title={t('openDb')}
        />
        <button
          onClick={() => {
            const win = YubiKeyConfigWindow(state, true)!;
            render(
              () => (
                <AppProvider>
                  <YubiKeyConfigPage window={win} />
                </AppProvider>
              ),
              win
            );
            win.activate();
          }}
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
          title={t('configureYubikey')}
        />
        <Expand />
      </container>
      <container
        style={{ flex: 1, flexDirection: 'row' }}
        visible={recent().length > 0}
      >
        <Expand direction="row" />
        <container style={{ flexDirection: 'column', width: 440 }}>
          <label
            align="start"
            style={{ 'margin-top': 20, 'margin-bottom': 5 }}
            text={t('recentDatabases')}
          />
          <table
            columnsVisible={false}
            columnsWithOptions={[
              {
                label: '',
                options: {
                  type: 'text',
                  width: -1
                }
              }
            ]}
            hasBorder={true}
            model={dbTable()}
            onRowActivate={async (_table, row) => {
              const win = DatabaseWindow(state);
              if (win) return win.activate();

              const path = recent()[row]!;
              openDatabase(props.window, path, state);
            }}
            style={{ flex: 4 }}
          />
        </container>
        <Expand direction="row" />
      </container>
      <Expand />
    </container>
  );
}

export { WelcomePage };
