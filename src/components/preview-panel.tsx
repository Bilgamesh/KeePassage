import { AttributedText, Window } from 'gui';
import { createEffect, createSignal } from 'solid-js';

import { PAGE_INDEXES, TITLE_FONT } from '@/data/constants';
import { copyPassword, getPassword, showQrCode } from '@/data/db-orchestrator';
import { appSettings, selectedEntry, setMainPageIndex } from '@/data/shared-state';
import { Entry } from '@/schemas/database-schema';
import { IconButton } from './icon-button';
import { PreviewLine } from './preview-line';

import clipboardIcon from '@/assets/icons/clipboard.png';
import eyeOffIcon from '@/assets/icons/eye-off.png';
import eyeIcon from '@/assets/icons/eye.png';
import qrcodeIcon from '@/assets/icons/qrcode.png';

function PreviewPanel(props: { window: Window; visible?: boolean; entry: Entry }) {
  const [password, setPassword] = createSignal<string | null>(null);

  async function showPassword() {
    const pw = await getPassword(props);
    setMainPageIndex(PAGE_INDEXES.DB_INDEX);
    setPassword(pw);
  }

  createEffect(() => {
    selectedEntry();
    setPassword(null);
  });

  const displayedUserName = () =>
    appSettings().hideUserNames ? props.entry.username.replaceAll(/./g, '*') : props.entry.username;

  return (
    <container
      visible={props.visible !== false}
      style={{
        flex: 1,
        margin: 20,
        'margin-top': 0
      }}
    >
      <label
        attributedText={AttributedText.create(props.entry.title, {
          font: TITLE_FONT,
          align: 'start'
        })}
        style={{ 'margin-left': 10 }}
      />
      <container style={{ flexDirection: 'row' }}>
        <container style={{ flex: 1, flexDirection: 'column' }}>
          <PreviewLine
            label="Username"
            value={displayedUserName()}
            style={{ 'margin-top': 10, height: 20 }}
          />
          <PreviewLine
            label="Password"
            value={password() === null ? '***' : password()!}
            style={{ 'margin-top': 10, height: process.platform === 'win32' ? 22 : 35 }}
          >
            <IconButton
              src={password() === null ? eyeIcon : eyeOffIcon}
              tooltip="Preview password"
              size={{ height: 20, width: 20 }}
              imageSize={{ height: 13, width: 13 }}
              style={{ 'margin-top': 0, 'margin-left': 0, 'margin-right': 2 }}
              onClick={() => {
                if (password() === null) {
                  showPassword();
                } else {
                  setPassword(null);
                }
              }}
            />
            <IconButton
              src={qrcodeIcon}
              tooltip="Generate QR code with password"
              size={{ height: 20, width: 20 }}
              imageSize={{ height: 13, width: 13 }}
              style={{ 'margin-top': 0, 'margin-left': 0, 'margin-right': 2 }}
              onClick={() => {
                showQrCode(props.window);
              }}
            />
            <IconButton
              src={clipboardIcon}
              tooltip="Copy password to clipboard"
              size={{ height: 20, width: 20 }}
              imageSize={{ height: 13, width: 13 }}
              style={{ 'margin-top': 0, 'margin-left': 0, 'margin-right': 2 }}
              onClick={() => {
                copyPassword(props.window);
              }}
            />
          </PreviewLine>
          <PreviewLine
            label="Tags"
            value={props.entry.tags}
            style={{ 'margin-top': 10, height: 20 }}
          />
        </container>
        <container style={{ flex: 1, flexDirection: 'column' }}>
          <PreviewLine
            label="URL"
            value={props.entry.url}
            style={{ 'margin-top': 10, height: 20 }}
          />
        </container>
      </container>
      <PreviewLine
        label="Notes"
        value={props.entry.notes}
        style={{ 'margin-top': 10, flex: 1 }}
        last={true}
      />
    </container>
  );
}

export { PreviewPanel };
