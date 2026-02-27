import { getRandomValues } from 'node:crypto';
import { Clipboard } from 'gui';
import { createSignal } from 'solid-js';
import clipboardIcon from '#/assets/icons/clipboard.png';
import eyeIcon from '#/assets/icons/eye.png';
import eyeOffIcon from '#/assets/icons/eye-off.png';
import refreshIcon from '#/assets/icons/refresh.png';
import { Expand } from '#/components/expand';
import { IconButton } from '#/components/icon-button';
import { NumericEntry } from '#/components/numeric-entry';
import {
  ENTRY_BUTTON_STYLE,
  LARGE_BUTTON_STYLE,
  LARGE_ENTRY_STYLE,
  PAGE_INDEXES,
  PASSWORD_FONT,
  SMALL_BUTTON_STYLE
} from '#/data/constants';
import { t } from '#/data/i18n';
import { mainPageIndex, setMainPageIndex } from '#/data/shared-state';
import { createListeners } from '#/utils/listen-util';

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
    const password = await pwListeners.waitForValue({
      signal: controller.signal
    });
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
    <group style={{ flex: 1, margin: 100 }} title={t('passwordGenerator')}>
      <container style={{ margin: 5, flexDirection: 'row' }}>
        <Expand direction="row" />
        <container style={{ flex: 8 }}>
          <Expand direction="column" />
          <container style={{ flexDirection: 'row', 'margin-bottom': 25 }}>
            <entry
              font={PASSWORD_FONT}
              onTextChange={(entry) => {
                setPassword(entry.getText());
              }}
              style={{ ...LARGE_ENTRY_STYLE, flex: 1 }}
              text={password()}
              visible={visible()}
            />
            <password
              font={PASSWORD_FONT}
              onTextChange={(entry) => {
                setPassword(entry.getText());
              }}
              style={{ ...LARGE_ENTRY_STYLE, flex: 1 }}
              text={password()}
              visible={!visible()}
            />
            <IconButton
              imageSize={{ height: 15, width: 15 }}
              onClick={() => {
                setVisible((v) => !v);
              }}
              size={{
                ...(ENTRY_BUTTON_STYLE as { height: number; width: number })
              }}
              src={visible() ? eyeOffIcon : eyeIcon}
              style={{ 'margin-top': 0, 'margin-left': 2 }}
              tooltip={t('previewPassword')}
            />
            <IconButton
              imageSize={{ height: 15, width: 15 }}
              onClick={() => {
                generate();
              }}
              size={{
                ...(ENTRY_BUTTON_STYLE as { height: number; width: number })
              }}
              src={refreshIcon}
              style={{ 'margin-top': 0, 'margin-left': 2 }}
              tooltip={t('generateNew')}
            />
            <IconButton
              imageSize={{ height: 15, width: 15 }}
              onClick={() => {
                if (password()) {
                  Clipboard.get().setText(password());
                }
              }}
              size={{
                ...(ENTRY_BUTTON_STYLE as { height: number; width: number })
              }}
              src={clipboardIcon}
              style={{ 'margin-top': 0, 'margin-left': 2 }}
              tooltip={t('copyToClipboard')}
            />
          </container>
          <label align="start" text={t('length')} />
          <container style={{ flexDirection: 'row' }}>
            <slider
              onValueChange={(slider) => {
                setPasswordPolicy((v) => ({
                  ...v,
                  length: Math.max(
                    Math.min(Math.round(slider.getValue()), 128),
                    1
                  )
                }));
                generate();
              }}
              range={{ min: 1, max: 129 }}
              step={1}
              style={{ flex: 1 }}
              value={passwordPolicy().length}
            />
            <NumericEntry
              entryStyle={{ width: 100, ...LARGE_ENTRY_STYLE }}
              maxValue={128}
              minValue={1}
              onValueChange={(value) => {
                setPasswordPolicy((v) => ({ ...v, length: value }));
                generate();
              }}
              value={passwordPolicy().length}
            />
          </container>
          <container style={{ height: 70, 'margin-top': 25 }}>
            <group style={{ flex: 1 }} title={t('charTypes')}>
              <container style={{ flexDirection: 'row' }}>
                <Expand direction="row" />
                <button
                  onClick={() => {
                    setPasswordPolicy((v) => ({
                      ...v,
                      upperCase: !v.upperCase
                    }));
                    generate();
                  }}
                  style={{
                    ...SMALL_BUTTON_STYLE,
                    'margin-left': 10,
                    'margin-top': 5
                  }}
                  title={`${passwordPolicy().upperCase ? '✓ ' : ''}A-Z`}
                />
                <button
                  onClick={() => {
                    setPasswordPolicy((v) => ({
                      ...v,
                      lowerCase: !v.lowerCase
                    }));
                    generate();
                  }}
                  style={{
                    ...SMALL_BUTTON_STYLE,
                    'margin-left': 10,
                    'margin-top': 5
                  }}
                  title={`${passwordPolicy().lowerCase ? '✓ ' : ''}a-z`}
                />
                <button
                  onClick={() => {
                    setPasswordPolicy((v) => ({ ...v, numbers: !v.numbers }));
                    generate();
                  }}
                  style={{
                    ...SMALL_BUTTON_STYLE,
                    'margin-left': 10,
                    'margin-top': 5
                  }}
                  title={`${passwordPolicy().numbers ? '✓ ' : ''}0-9`}
                />
                <button
                  onClick={() => {
                    setPasswordPolicy((v) => ({ ...v, symbols: !v.symbols }));
                    generate();
                  }}
                  style={{
                    ...SMALL_BUTTON_STYLE,
                    'margin-left': 10,
                    'margin-top': 5
                  }}
                  title={`${passwordPolicy().symbols ? '✓ ' : ''}/ * + & ...`}
                />
                <Expand direction="row" />
              </container>
            </group>
          </container>
          <Expand direction="column" />
          <container style={{ flexDirection: 'row' }}>
            <Expand direction="row" />
            <button
              enabled={password().length > 0}
              onClick={() => {
                pwListeners.notifyListeners(password());
                setMainPageIndex(previousPageIndex);
                setPassword('');
              }}
              style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
              title={t('applyPassword')}
              visible={requestInProgress()}
            />
            <button
              onClick={() => {
                setMainPageIndex(previousPageIndex);
                setPassword('');
                if (controller && !controller.signal.aborted) {
                  controller.abort('Cancel');
                }
              }}
              style={{ ...SMALL_BUTTON_STYLE, 'margin-left': 10 }}
              title={t('close')}
            />
          </container>
        </container>
        <Expand direction="row" />
      </container>
    </group>
  );
}

export { getGeneratedPassword, openPasswordGenerator, PwGeneratorPage };
