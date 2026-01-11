import { PAGE_INDEXES } from '@/data/constants';
import { copyPassword, getPassword, showQrCode } from '@/data/db-orchestrator';
import { appSettings, selectedEntry, setMainPageIndex } from '@/data/shared-state';
import { Entry } from '@/schemas/database-schema';
import { TitleFont } from '@/styles';
import { AttributedText, Window } from 'gui';
import { createEffect, createSignal } from 'solid-js';
import { IconButton } from './icon-button';
import { PreviewLine } from './preview-line';

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
        'margin-top': 0,
        ...(process.platform === 'linux' ? { backgroundColor: '#FFFFFF' } : {})
      }}
    >
      <label
        attributedText={AttributedText.create(props.entry.title, {
          font: TitleFont,
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
              icon={password() === null ? 'eye.png' : 'eye-off.png'}
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
              icon="qrcode.png"
              tooltip="Generate QR code with password"
              size={{ height: 20, width: 20 }}
              imageSize={{ height: 13, width: 13 }}
              style={{ 'margin-top': 0, 'margin-left': 0, 'margin-right': 2 }}
              onClick={() => {
                showQrCode(props.window);
              }}
            />
            <IconButton
              icon="clipboard.png"
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
