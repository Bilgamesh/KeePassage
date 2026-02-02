import { getRandomValues } from 'crypto';
import { Clipboard } from 'gui';
import { createSignal } from 'solid-js';

import { Expand } from '@/components/expand';
import { IconButton } from '@/components/icon-button';
import { NumericEntry } from '@/components/numeric-entry';
import {
  ENTRY_BUTTON_STYLE,
  LARGE_BUTTON_STYLE,
  LARGE_ENTRY_STYLE,
  PAGE_INDEXES,
  PASSWORD_FONT,
  SMALL_BUTTON_STYLE
} from '@/data/constants';
import { mainPageIndex, setMainPageIndex } from '@/data/shared-state';
import { createListeners } from '@/utils/listen-util';

import clipboardIcon from '@/assets/icons/clipboard.png';
import eyeOffIcon from '@/assets/icons/eye-off.png';
import eyeIcon from '@/assets/icons/eye.png';
import refreshIcon from '@/assets/icons/refresh.png';
import { t } from '@/data/i18n';

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
    <group title={t('passwordGenerator')} style={{ flex: 1, margin: 100 }}>
      <container style={{ margin: 5, flexDirection: 'row' }}>
        <Expand direction="row" />
        <container style={{ flex: 8 }}>
          <Expand direction="column" />
          <container style={{ flexDirection: 'row', 'margin-bottom': 25 }}>
            <entry
              visible={visible()}
              font={PASSWORD_FONT}
              style={{ ...LARGE_ENTRY_STYLE, flex: 1 }}
              text={password()}
              onTextChange={(entry) => {
                setPassword(entry.getText());
              }}
            />
            <password
              visible={!visible()}
              font={PASSWORD_FONT}
              style={{ ...LARGE_ENTRY_STYLE, flex: 1 }}
              text={password()}
              onTextChange={(entry) => {
                setPassword(entry.getText());
              }}
            />
            <IconButton
              tooltip={t('previewPassword')}
              src={visible() ? eyeOffIcon : eyeIcon}
              size={{ ...(ENTRY_BUTTON_STYLE as { height: number; width: number }) }}
              imageSize={{ height: 15, width: 15 }}
              style={{ 'margin-top': 0, 'margin-left': 2 }}
              onClick={() => {
                setVisible((v) => !v);
              }}
            />
            <IconButton
              tooltip={t('generateNew')}
              src={refreshIcon}
              size={{ ...(ENTRY_BUTTON_STYLE as { height: number; width: number }) }}
              imageSize={{ height: 15, width: 15 }}
              style={{ 'margin-top': 0, 'margin-left': 2 }}
              onClick={() => {
                generate();
              }}
            />
            <IconButton
              tooltip={t('copyToClipboard')}
              src={clipboardIcon}
              size={{ ...(ENTRY_BUTTON_STYLE as { height: number; width: number }) }}
              imageSize={{ height: 15, width: 15 }}
              style={{ 'margin-top': 0, 'margin-left': 2 }}
              onClick={() => {
                if (password()) {
                  Clipboard.get().setText(password());
                }
              }}
            />
          </container>
          <label text={t('length')} align="start" />
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
              entryStyle={{ width: 100, ...LARGE_ENTRY_STYLE }}
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
            <group title={t('charTypes')} style={{ flex: 1 }}>
              <container style={{ flexDirection: 'row' }}>
                <Expand direction="row" />
                <button
                  title={`${passwordPolicy().upperCase ? '✓ ' : ''}A-Z`}
                  style={{ ...SMALL_BUTTON_STYLE, 'margin-left': 10, 'margin-top': 5 }}
                  onClick={() => {
                    setPasswordPolicy((v) => ({ ...v, upperCase: !v.upperCase }));
                    generate();
                  }}
                />
                <button
                  title={`${passwordPolicy().lowerCase ? '✓ ' : ''}a-z`}
                  style={{ ...SMALL_BUTTON_STYLE, 'margin-left': 10, 'margin-top': 5 }}
                  onClick={() => {
                    setPasswordPolicy((v) => ({ ...v, lowerCase: !v.lowerCase }));
                    generate();
                  }}
                />
                <button
                  title={`${passwordPolicy().numbers ? '✓ ' : ''}0-9`}
                  style={{ ...SMALL_BUTTON_STYLE, 'margin-left': 10, 'margin-top': 5 }}
                  onClick={() => {
                    setPasswordPolicy((v) => ({ ...v, numbers: !v.numbers }));
                    generate();
                  }}
                />
                <button
                  title={`${passwordPolicy().symbols ? '✓ ' : ''}/ * + & ...`}
                  style={{ ...SMALL_BUTTON_STYLE, 'margin-left': 10, 'margin-top': 5 }}
                  onClick={() => {
                    setPasswordPolicy((v) => ({ ...v, symbols: !v.symbols }));
                    generate();
                  }}
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
              title={t('applyPassword')}
              style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
              onClick={() => {
                pwListeners.notifyListeners(password());
                setMainPageIndex(previousPageIndex);
                setPassword('');
              }}
            />
            <button
              title={t('close')}
              style={{ ...SMALL_BUTTON_STYLE, 'margin-left': 10 }}
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
