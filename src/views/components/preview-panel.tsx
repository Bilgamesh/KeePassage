import { AttributedText, type Window } from 'gui';
import { createEffect, createSignal } from 'solid-js';
import clipboardIcon from '#/assets/icons/clipboard.png';
import eyeIcon from '#/assets/icons/eye.png';
import eyeOffIcon from '#/assets/icons/eye-off.png';
import qrcodeIcon from '#/assets/icons/qrcode.png';
import { PAGE_INDEXES, TITLE_FONT } from '#/data/constants';
import { copyPassword, getPassword, showQrCode } from '#/data/db-orchestrator';
import { t } from '#/data/i18n';
import {
  appSettings,
  selectedEntry,
  setMainPageIndex
} from '#/data/shared-state';
import type { Entry } from '#/schemas/database-schema';
import { IconButton } from './icon-button';
import { PreviewLine } from './preview-line';

function PreviewPanel(props: {
  window: Window;
  visible?: boolean;
  entry: Entry;
}) {
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
    appSettings().hideUserNames
      ? props.entry.username.replaceAll(/./g, '*')
      : props.entry.username;

  return (
    <container
      style={{
        flex: 1,
        margin: 20,
        'margin-top': 0
      }}
      visible={props.visible !== false}
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
            label={`${t('username')}:`}
            style={{ 'margin-top': 10, height: 20 }}
            value={displayedUserName()}
          />
          <PreviewLine
            label={t('password')}
            style={{
              'margin-top': 10,
              height: process.platform === 'win32' ? 22 : 35
            }}
            value={password() === null ? '***' : password()!}
          >
            <IconButton
              imageSize={{ height: 13, width: 13 }}
              onClick={() => {
                if (password() === null) {
                  showPassword();
                } else {
                  setPassword(null);
                }
              }}
              size={{ height: 20, width: 20 }}
              src={password() === null ? eyeIcon : eyeOffIcon}
              style={{ 'margin-top': 0, 'margin-left': 0, 'margin-right': 2 }}
              tooltip={t('previewPassword')}
            />
            <IconButton
              imageSize={{ height: 13, width: 13 }}
              onClick={() => {
                showQrCode(props.window);
              }}
              size={{ height: 20, width: 20 }}
              src={qrcodeIcon}
              style={{ 'margin-top': 0, 'margin-left': 0, 'margin-right': 2 }}
              tooltip={t('showQrCode')}
            />
            <IconButton
              imageSize={{ height: 13, width: 13 }}
              onClick={() => {
                copyPassword(props.window);
              }}
              size={{ height: 20, width: 20 }}
              src={clipboardIcon}
              style={{ 'margin-top': 0, 'margin-left': 0, 'margin-right': 2 }}
              tooltip={t('copyPassword')}
            />
          </PreviewLine>
          <PreviewLine
            label={t('tags')}
            style={{ 'margin-top': 10, height: 20 }}
            value={props.entry.tags}
          />
        </container>
        <container style={{ flex: 1, flexDirection: 'column' }}>
          <PreviewLine
            label={t('url')}
            style={{ 'margin-top': 10, height: 20 }}
            value={props.entry.url}
          />
        </container>
      </container>
      <PreviewLine
        label={t('notes')}
        last={true}
        style={{ 'margin-top': 10, flex: 1 }}
        value={props.entry.notes}
      />
    </container>
  );
}

export { PreviewPanel };
