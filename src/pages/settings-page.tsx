import { Expand } from '@/components/expand';
import { TimeoutEntry } from '@/components/timeout-entry';
import { DEFAULT_SETTINGS, PAGE_INDEXES } from '@/data/constants';
import { appSettings, mainPageIndex, setMainPageIndex } from '@/data/shared-state';
import { updateSettings } from '@/service/config-service';
import { LargeButton, TitleFont } from '@/styles';
import { AttributedText, MessageBox, Window } from 'gui';
import { createEffect, createSignal } from 'solid-js';

const [unsavedAppSettings, setUnsavedAppSettings] = createSignal({ ...appSettings() });

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
  createEffect(() => {
    const savedSettings = appSettings();
    setUnsavedAppSettings({ ...savedSettings });
  });

  return (
    <container style={{ flex: 1, margin: 20 }}>
      <label
        style={{ 'margin-left': 5 }}
        attributedText={AttributedText.create('Application Settings', {
          align: 'start',
          font: TitleFont
        })}
      />
      <group title="User Interface" style={{ height: 180, 'margin-top': 10 }}>
        <container>
          <container style={{ 'margin-left': 10 }}>
            <checkbox
              title="Show toolbar"
              checked={unsavedAppSettings().showToolbar}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({ ...s, showToolbar: checkbox.isChecked() }));
              }}
            />
            <checkbox
              title="Show menubar"
              checked={unsavedAppSettings().showMenuBar}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({ ...s, showMenuBar: checkbox.isChecked() }));
              }}
            />
            <checkbox
              title="Show preview panel"
              checked={unsavedAppSettings().showPreview}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({ ...s, showPreview: checkbox.isChecked() }));
              }}
            />
            <checkbox
              title="Minimise instead of app exit"
              checked={unsavedAppSettings().minimiseInsteadOfExit}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  minimiseInsteadOfExit: checkbox.isChecked()
                }));
              }}
            />
            <checkbox
              title="Show a system tray icon"
              checked={unsavedAppSettings().showTrayIcon}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({ ...s, showTrayIcon: checkbox.isChecked() }));
              }}
            />
            <checkbox
              title="Always on top"
              checked={unsavedAppSettings().alwaysOnTop}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({ ...s, alwaysOnTop: checkbox.isChecked() }));
              }}
            />
            <checkbox
              title="Hide usernames"
              checked={unsavedAppSettings().hideUserNames}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({ ...s, hideUserNames: checkbox.isChecked() }));
              }}
            />
          </container>
        </container>
      </group>
      <group title="Timeouts" style={{ height: 85, 'margin-top': 10 }}>
        <container>
          <container style={{ 'margin-left': 10 }}>
            <TimeoutEntry
              title="Clear clipboard after"
              checkboxWidth={200}
              entryWidth={50}
              style={{ 'margin-bottom': 5 }}
              checked={unsavedAppSettings().clipboardTimout !== null}
              value={unsavedAppSettings().clipboardTimout || 0}
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
            />
            <TimeoutEntry
              title="Lock database after inactivity of"
              checkboxWidth={200}
              entryWidth={50}
              checked={unsavedAppSettings().dbTimeout !== null}
              value={unsavedAppSettings().dbTimeout || 0}
              onClick={(checked) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  dbTimeout: checked ? s.dbTimeout || DEFAULT_SETTINGS.dbTimeout : null
                }));
              }}
              onValueChange={(value) => {
                unsavedAppSettings().dbTimeout = value;
              }}
            />
          </container>
        </container>
      </group>
      <group title="Lock Options" style={{ height: 50, 'margin-top': 10 }}>
        <container>
          <container style={{ 'margin-left': 10 }}>
            <checkbox
              title="Lock database after minimising the window"
              checked={unsavedAppSettings().dbMinimiseLock}
              onClick={(checkbox) => {
                setUnsavedAppSettings((s) => ({
                  ...s,
                  dbMinimiseLock: checkbox.isChecked()
                }));
              }}
            />
          </container>
        </container>
      </group>
      <Expand direction="column" />
      <container style={{ flexDirection: 'row' }}>
        <button
          title="Reset settings to default"
          style={{ ...LargeButton, 'margin-left': 10 }}
          onClick={() => {
            const msgBox = MessageBox.create();
            msgBox.setType('information');
            msgBox.setTitle('Confirm reset');
            msgBox.setText('Are you sure you want to reset all settings to default?');
            msgBox.addButton('Cancel', -1);
            msgBox.addButton('Reset', 1);
            if (msgBox.runForWindow(props.window) === 1) {
              setMainPageIndex(previousPageIndex);
              updateSettings(() => DEFAULT_SETTINGS);
            }
          }}
        />
        <Expand direction="row" />
        <button
          title="OK"
          style={{ ...LargeButton, 'margin-left': 10 }}
          onClick={() => {
            setMainPageIndex(previousPageIndex);
            updateSettings(() => unsavedAppSettings());
          }}
        />
        <button
          title="Cancel"
          style={{ ...LargeButton, 'margin-left': 10 }}
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
