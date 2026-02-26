import { AttributedText, MessageBox, type Picker, type Window } from 'gui';
import { createEffect, createMemo, createSignal } from 'solid-js';
import { Expand } from '@/components/expand';
import { TimeoutEntry } from '@/components/timeout-entry';
import {
  DEFAULT_SETTINGS,
  LARGE_BUTTON_STYLE,
  PAGE_INDEXES,
  TITLE_FONT,
} from '@/data/constants';
import { dictionaries, t } from '@/data/i18n';
import {
  appSettings,
  mainPageIndex,
  setMainPageIndex,
} from '@/data/shared-state';
import { updateSettings } from '@/service/config-service';

const [unsavedAppSettings, setUnsavedAppSettings] = createSignal({
  ...appSettings(),
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
    dictionaries.map((dict) => t(dict.languageCode as 'en')),
  );
  const currentLanguageIndex = () =>
    dictionaries.findIndex(
      (d) => d.languageCode === unsavedAppSettings().language,
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
        style={{ 'margin-left': 5 }}
        attributedText={AttributedText.create(t('applicationSettings'), {
          align: 'start',
          font: TITLE_FONT,
        })}
      />
      <group
        title={t('userInterface')}
        style={{ height: 250, 'margin-top': 10 }}
      >
        <container>
          <container style={{ 'margin-left': 10 }}>
            <checkbox
              title={t('showToolbar')}
              checked={unsavedAppSettings().showToolbar}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  showToolbar: checkbox.isChecked(),
                }));
              }}
            />
            <checkbox
              title={t('showMenubar')}
              checked={unsavedAppSettings().showMenuBar}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  showMenuBar: checkbox.isChecked(),
                }));
              }}
            />
            <checkbox
              title={t('showPreviewPanel')}
              checked={unsavedAppSettings().showPreview}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  showPreview: checkbox.isChecked(),
                }));
              }}
            />
            <checkbox
              title={t('minimiseInsteadOfExit')}
              checked={unsavedAppSettings().minimiseInsteadOfExit}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  minimiseInsteadOfExit: checkbox.isChecked(),
                }));
              }}
            />
            <checkbox
              title={t('showTrayIcon')}
              checked={unsavedAppSettings().showTrayIcon}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  showTrayIcon: checkbox.isChecked(),
                }));
              }}
            />
            <checkbox
              title={t('alwaysOnTop')}
              checked={unsavedAppSettings().alwaysOnTop}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  alwaysOnTop: checkbox.isChecked(),
                }));
              }}
            />
            <checkbox
              title={t('hideUserNames')}
              checked={unsavedAppSettings().hideUserNames}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  hideUserNames: checkbox.isChecked(),
                }));
              }}
            />
            <container style={{ 'margin-top': 10, flexDirection: 'row' }}>
              <label text={`${t('language')}: `} />
              <picker
                ref={({ node }) => {
                  picker = node;
                }}
                style={{ width: LARGE_BUTTON_STYLE.width! }}
                selectedItemIndex={currentLanguageIndex()}
                items={languages()}
                onSelectionChange={(picker) => {
                  const index = picker.getSelectedItemIndex();
                  const dict = dictionaries[index]!;
                  setUnsavedAppSettings((s) => ({
                    ...s,
                    language: dict.languageCode,
                  }));
                }}
              />
            </container>
          </container>
        </container>
      </group>
      <group
        title={t('timeouts')}
        style={{
          height: process.platform === 'win32' ? 85 : 100,
          'margin-top': 10,
        }}
      >
        <container>
          <container style={{ 'margin-left': 10 }}>
            <TimeoutEntry
              title={t('clearClipboardAfter')}
              checkboxWidth={process.platform === 'win32' ? 250 : 300}
              entryWidth={50}
              style={{ 'margin-bottom': 5 }}
              checked={unsavedAppSettings().clipboardTimout !== null}
              value={unsavedAppSettings().clipboardTimout || 0}
              onClick={(checked) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  clipboardTimout: checked
                    ? s.clipboardTimout || DEFAULT_SETTINGS.clipboardTimout
                    : null,
                }));
              }}
              onValueChange={(value) => {
                unsavedAppSettings().clipboardTimout = value;
              }}
            />
            <TimeoutEntry
              title={t('lockDatabaseAfter')}
              checkboxWidth={process.platform === 'win32' ? 250 : 300}
              entryWidth={50}
              checked={unsavedAppSettings().dbTimeout !== null}
              value={unsavedAppSettings().dbTimeout || 0}
              onClick={(checked) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  dbTimeout: checked
                    ? s.dbTimeout || DEFAULT_SETTINGS.dbTimeout
                    : null,
                }));
              }}
              onValueChange={(value) => {
                unsavedAppSettings().dbTimeout = value;
              }}
            />
          </container>
        </container>
      </group>
      <group title={t('lockOptions')} style={{ height: 50, 'margin-top': 10 }}>
        <container>
          <container style={{ 'margin-left': 10 }}>
            <checkbox
              title={t('dbMinimiseLock')}
              checked={unsavedAppSettings().dbMinimiseLock}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  dbMinimiseLock: checkbox.isChecked(),
                }));
              }}
            />
          </container>
        </container>
      </group>
      <Expand direction="column" />
      <container style={{ flexDirection: 'row' }}>
        <button
          title={t('resetSettings')}
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
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
        />
        <Expand direction="row" />
        <button
          title={t('ok')}
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
          onClick={() => {
            setMainPageIndex(previousPageIndex);
            updateSettings(() => unsavedAppSettings());
          }}
        />
        <button
          title={t('cancel')}
          style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
          onClick={() => {
            setMainPageIndex(previousPageIndex);
            reset();
          }}
        />
      </container>
    </container>
  );
}

export { openSettingsPage, SettingsPage };
