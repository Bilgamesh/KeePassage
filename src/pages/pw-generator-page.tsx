import { Expand } from '@/components/expand';
import { IconButton } from '@/components/icon-button';
import { NumericEntry } from '@/components/numeric-entry';
import { PAGE_INDEXES } from '@/data/constants';
import { mainPageIndex, setMainPageIndex } from '@/data/shared-state';
import {
  CheckmarkIcon,
  EntryButton,
  LargeButton,
  LargeEntry,
  PasswordFont,
  SmallButton
} from '@/styles';
import { createListeners } from '@/utils/listen-util';
import { getRandomValues } from 'crypto';
import { Clipboard, Image } from 'gui';
import { createSignal } from 'solid-js';

const [password, setPassword] = createSignal('');
const [passwordPolicy, setPasswordPolicy] = createSignal({
  lowerCase: true,
  upperCase: true,
  numbers: true,
  symbols: true,
  length: 32
});
let previousPageIndex: number = PAGE_INDEXES.WELCOME;
let controller: AbortController;
const pwListeners = createListeners<string>();
const [requestInProgress, setRequestInProgress] = createSignal(false);

async function getGeneratedPassword() {
  setRequestInProgress(true);
  controller = new AbortController();
  openPasswordGenerator();
  try {
    const password = await pwListeners.waitForValue({ signal: controller.signal });
    setRequestInProgress(false);
    return password;
  } catch (err) {
    console.error(`Failed to get generated password: ${err}`);
    setRequestInProgress(false);
    return null;
  }
}

function openPasswordGenerator() {
  if (mainPageIndex() !== PAGE_INDEXES.GENERATOR) {
    previousPageIndex = mainPageIndex();
    setPassword('');
    setMainPageIndex(PAGE_INDEXES.GENERATOR);
    generate();
  }
}

function generate() {
  let charset = '';
  if (passwordPolicy().lowerCase) {
    charset += 'abcdefghijklmnopqrstuvwxyz';
  }
  if (passwordPolicy().numbers) {
    charset += '0123456789';
  }
  if (passwordPolicy().symbols) {
    charset += '!@#$%^&*()_+[]{}|;:,.<>?~';
  }
  if (passwordPolicy().upperCase || charset === '') {
    charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  let password = '';
  const array = getRandomValues(new Uint32Array(passwordPolicy().length));
  for (let i = 0; i < passwordPolicy().length; i++) {
    password += charset[array[i]! % charset.length];
  }
  setPassword(password);
}

function PwGeneratorPage() {
  const [visible, setVisible] = createSignal(true);

  return (
    <group title="Password generator" style={{ flex: 1, margin: 100 }}>
      <container style={{ margin: 5, flexDirection: 'row' }}>
        <Expand direction="row" />
        <container style={{ flex: 8 }}>
          <Expand direction="column" />
          <container style={{ flexDirection: 'row', 'margin-bottom': 25 }}>
            <entry
              visible={visible()}
              font={PasswordFont}
              style={{ ...LargeEntry, flex: 1 }}
              text={password()}
              onTextChange={(entry) => {
                setPassword(entry.getText());
              }}
            />
            <password
              visible={!visible()}
              font={PasswordFont}
              style={{ ...LargeEntry, flex: 1 }}
              text={password()}
              onTextChange={(entry) => {
                setPassword(entry.getText());
              }}
            />
            <IconButton
              tooltip="Preview password"
              icon={visible() ? 'eye-off.png' : 'eye.png'}
              size={{ ...(EntryButton as { height: number; width: number }) }}
              imageSize={{ height: 15, width: 15 }}
              style={{ 'margin-top': 0, 'margin-left': 2 }}
              onClick={() => {
                setVisible((v) => !v);
              }}
            />
            <IconButton
              tooltip="Generate new password"
              icon="refresh.png"
              size={{ ...(EntryButton as { height: number; width: number }) }}
              imageSize={{ height: 15, width: 15 }}
              style={{ 'margin-top': 0, 'margin-left': 2 }}
              onClick={() => {
                generate();
              }}
            />
            <IconButton
              tooltip="Copy password to clipboard"
              icon="clipboard.png"
              size={{ ...(EntryButton as { height: number; width: number }) }}
              imageSize={{ height: 15, width: 15 }}
              style={{ 'margin-top': 0, 'margin-left': 2 }}
              onClick={() => {
                if (password()) {
                  Clipboard.get().setText(password());
                }
              }}
            />
          </container>
          <label text="Length" align="start" />
          <container style={{ flexDirection: 'row' }}>
            <slider
              range={{ min: 1, max: 129 }}
              style={{ flex: 1 }}
              value={passwordPolicy().length}
              step={1}
              onValueChange={(slider) => {
                setPasswordPolicy((v) => ({
                  ...v,
                  length: Math.max(Math.min(Math.round(slider.getValue()), 128), 1)
                }));
                generate();
              }}
            />
            <NumericEntry
              entryStyle={{ width: 100, ...LargeEntry }}
              value={passwordPolicy().length}
              minValue={1}
              maxValue={128}
              onValueChange={(value) => {
                setPasswordPolicy((v) => ({ ...v, length: value }));
                generate();
              }}
            />
          </container>
          <container style={{ height: 70, 'margin-top': 25 }}>
            <group title="Character types" style={{ flex: 1 }}>
              <container style={{ flexDirection: 'row' }}>
                <Expand direction="row" />
                <button
                  title="A-Z"
                  style={{ ...SmallButton, 'margin-left': 10, 'margin-top': 5 }}
                  onClick={() => {
                    setPasswordPolicy((v) => ({ ...v, upperCase: !v.upperCase }));
                    generate();
                  }}
                  image={passwordPolicy().upperCase ? CheckmarkIcon : Image.createEmpty()}
                />
                <button
                  title="a-z"
                  style={{ ...SmallButton, 'margin-left': 10, 'margin-top': 5 }}
                  onClick={() => {
                    setPasswordPolicy((v) => ({ ...v, lowerCase: !v.lowerCase }));
                    generate();
                  }}
                  image={passwordPolicy().lowerCase ? CheckmarkIcon : Image.createEmpty()}
                />
                <button
                  title="0-9"
                  style={{ ...SmallButton, 'margin-left': 10, 'margin-top': 5 }}
                  onClick={() => {
                    setPasswordPolicy((v) => ({ ...v, numbers: !v.numbers }));
                    generate();
                  }}
                  image={passwordPolicy().numbers ? CheckmarkIcon : Image.createEmpty()}
                />
                <button
                  title="/ * + & ..."
                  style={{ ...SmallButton, 'margin-left': 10, 'margin-top': 5 }}
                  onClick={() => {
                    setPasswordPolicy((v) => ({ ...v, symbols: !v.symbols }));
                    generate();
                  }}
                  image={passwordPolicy().symbols ? CheckmarkIcon : Image.createEmpty()}
                />
                <Expand direction="row" />
              </container>
            </group>
          </container>
          <Expand direction="column" />
          <container style={{ flexDirection: 'row' }}>
            <Expand direction="row" />
            <button
              visible={requestInProgress()}
              enabled={password().length > 0}
              title="Apply password"
              style={{ ...LargeButton, 'margin-left': 10 }}
              onClick={() => {
                pwListeners.notifyListeners(password());
                setMainPageIndex(previousPageIndex);
                setPassword('');
              }}
            />
            <button
              title="Close"
              style={{ ...SmallButton, 'margin-left': 10 }}
              onClick={() => {
                setMainPageIndex(previousPageIndex);
                setPassword('');
                if (controller && !controller.signal.aborted) {
                  controller.abort('Cancel');
                }
              }}
            />
          </container>
        </container>
        <Expand direction="row" />
      </container>
    </group>
  );
}

export { getGeneratedPassword, openPasswordGenerator, PwGeneratorPage };
