import { AttributedText, MessageBox, type Picker, type Window } from 'gui';
import { createEffect, createMemo, createSignal } from 'solid-js';
import { Expand } from '#/components/expand';
import { TimeoutEntry } from '#/components/timeout-entry';
import {
  DEFAULT_SETTINGS,
  LARGE_BUTTON_STYLE,
  PAGE_INDEXES,
  TITLE_FONT
} from '#/data/constants';
import { dictionaries, t } from '#/data/i18n';
import {
  appSettings,
  mainPageIndex,
  setMainPageIndex
} from '#/data/shared-state';
import { updateSettings } from '#/service/config-service';

const [unsavedAppSettings, setUnsavedAppSettings] = createSignal({
  ...appSettings()
});

let previousPageIndex: number = PAGE_INDEXES.WELCOME;

function reset() {
  setUnsavedAppSettings((s) => ({ ...s }));
  setUnsavedAppSettings({ ...appSettings() });
}

function openSettingsPage() {
  if (mainPageIndex() !== PAGE_INDEXES.SETTINGS) {
    previousPageIndex = mainPageIndex();
    reset();
    setMainPageIndex(PAGE_INDEXES.SETTINGS);
  }
}

function SettingsPage(props: { window: Window }) {
  const languages = createMemo(() =>
    dictionaries.map((dict) => t(dict.languageCode as 'en'))
  );
  const currentLanguageIndex = () =>
    dictionaries.findIndex(
      (d) => d.languageCode === unsavedAppSettings().language
    );
  let picker: Picker;

  createEffect(() => {
    const savedSettings = appSettings();
    setUnsavedAppSettings({ ...savedSettings });
  });

  createEffect(() => {
    mainPageIndex();
    picker.selectItemAt(currentLanguageIndex());
  });

  return (
    <container style={{ flex: 1, margin: 20 }}>
      <label
        attributedText={AttributedText.create(t('applicationSettings'), {
          align: 'start',
          font: TITLE_FONT
        })}
        style={{ 'margin-left': 5 }}
      />
      <group
        style={{ height: 250, 'margin-top': 10 }}
        title={t('userInterface')}
      >
        <container>
          <container style={{ 'margin-left': 10 }}>
            <checkbox
              checked={unsavedAppSettings().showToolbar}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  showToolbar: checkbox.isChecked()
                }));
              }}
              title={t('showToolbar')}
            />
            <checkbox
              checked={unsavedAppSettings().showMenuBar}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  showMenuBar: checkbox.isChecked()
                }));
              }}
              title={t('showMenubar')}
            />
            <checkbox
              checked={unsavedAppSettings().showPreview}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  showPreview: checkbox.isChecked()
                }));
              }}
              title={t('showPreviewPanel')}
            />
            <checkbox
              checked={unsavedAppSettings().minimiseInsteadOfExit}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  minimiseInsteadOfExit: checkbox.isChecked()
                }));
              }}
              title={t('minimiseInsteadOfExit')}
            />
            <checkbox
              checked={unsavedAppSettings().showTrayIcon}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  showTrayIcon: checkbox.isChecked()
                }));
              }}
              title={t('showTrayIcon')}
            />
            <checkbox
              checked={unsavedAppSettings().alwaysOnTop}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  alwaysOnTop: checkbox.isChecked()
                }));
              }}
              title={t('alwaysOnTop')}
            />
            <checkbox
              checked={unsavedAppSettings().hideUserNames}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  hideUserNames: checkbox.isChecked()
                }));
              }}
              title={t('hideUserNames')}
            />
            <container style={{ 'margin-top': 10, flexDirection: 'row' }}>
              <label text={`${t('language')}: `} />
              <picker
                items={languages()}
                onSelectionChange={(picker) => {
                  const index = picker.getSelectedItemIndex();
                  const dict = dictionaries[index]!;
                  setUnsavedAppSettings((s) => ({
                    ...s,
                    language: dict.languageCode
                  }));
                }}
                ref={({ node }) => {
                  picker = node;
                }}
                selectedItemIndex={currentLanguageIndex()}
                style={{ width: LARGE_BUTTON_STYLE.width! }}
              />
            </container>
          </container>
        </container>
      </group>
      <group
        style={{
          height: process.platform === 'win32' ? 85 : 100,
          'margin-top': 10
        }}
        title={t('timeouts')}
      >
        <container>
          <container style={{ 'margin-left': 10 }}>
            <TimeoutEntry
              checkboxWidth={process.platform === 'win32' ? 250 : 300}
              checked={unsavedAppSettings().clipboardTimout !== null}
              entryWidth={50}
              onClick={(checked) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  clipboardTimout: checked
                    ? s.clipboardTimout || DEFAULT_SETTINGS.clipboardTimout
                    : null
                }));
              }}
              onValueChange={(value) => {
                unsavedAppSettings().clipboardTimout = value;
              }}
              style={{ 'margin-bottom': 5 }}
              title={t('clearClipboardAfter')}
              value={unsavedAppSettings().clipboardTimout || 0}
            />
            <TimeoutEntry
              checkboxWidth={process.platform === 'win32' ? 250 : 300}
              checked={unsavedAppSettings().dbTimeout !== null}
              entryWidth={50}
              onClick={(checked) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  dbTimeout: checked
                    ? s.dbTimeout || DEFAULT_SETTINGS.dbTimeout
                    : null
                }));
              }}
              onValueChange={(value) => {
                unsavedAppSettings().dbTimeout = value;
              }}
              title={t('lockDatabaseAfter')}
              value={unsavedAppSettings().dbTimeout || 0}
            />
          </container>
        </container>
      </group>
      <group style={{ height: 50, 'margin-top': 10 }} title={t('lockOptions')}>
        <container>
          <container style={{ 'margin-left': 10 }}>
            <checkbox
              checked={unsavedAppSettings().dbMinimiseLock}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  dbMinimiseLock: checkbox.isChecked()
                }));
              }}
              title={t('dbMinimiseLock')}
            />
          </container>
        </container>
      </group>
      <Expand direction="column" />
      <container style={{ flexDirection: 'row' }}>
        <button
          onClick={() => {
            const msgBox = MessageBox.create();
            msgBox.setType('information');
            msgBox.setTitle(t('confirmReset'));
            msgBox.setText(t('areYouSureReset'));
            msgBox.addButton(t('cancel'), -1);
            msgBox.addButton(t('reset'), 1);
            if (msgBox.runForWindow(props.window) === 1) {
              setMainPageIndex(previousPageIndex);
              updateSettings(() => DEFAULT_SETTINGS);
            }
          }}
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
          title={t('resetSettings')}
        />
        <Expand direction="row" />
        <button
          onClick={() => {
            setMainPageIndex(previousPageIndex);
            updateSettings(() => unsavedAppSettings());
          }}
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
          title={t('ok')}
        />
        <button
          onClick={() => {
            setMainPageIndex(previousPageIndex);
            reset();
          }}
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
          title={t('cancel')}
        />
      </container>
    </container>
  );
}

export { openSettingsPage, SettingsPage };
