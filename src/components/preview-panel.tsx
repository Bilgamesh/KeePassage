import { AttributedText, type Window } from 'gui';
import { createEffect, createSignal } from 'solid-js';
import clipboardIcon from '@/assets/icons/clipboard.png';
import eyeIcon from '@/assets/icons/eye.png';
import eyeOffIcon from '@/assets/icons/eye-off.png';
import qrcodeIcon from '@/assets/icons/qrcode.png';
import { PAGE_INDEXES, TITLE_FONT } from '@/data/constants';
import { copyPassword, getPassword, showQrCode } from '@/data/db-orchestrator';
import { t } from '@/data/i18n';
import {
  appSettings,
  selectedEntry,
  setMainPageIndex,
} from '@/data/shared-state';
import type { Entry } from '@/schemas/database-schema';
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
      visible={props.visible !== false}
      style={{
        flex: 1,
        margin: 20,
        'margin-top': 0,
      }}
    >
      <label
        attributedText={AttributedText.create(props.entry.title, {
          font: TITLE_FONT,
          align: 'start',
        })}
        style={{ 'margin-left': 10 }}
      />
      <container style={{ flexDirection: 'row' }}>
        <container style={{ flex: 1, flexDirection: 'column' }}>
          <PreviewLine
            label={`${t('username')}:`}
            value={displayedUserName()}
            style={{ 'margin-top': 10, height: 20 }}
          />
          <PreviewLine
            label={t('password')}
            value={password() === null ? '***' : password()!}
            style={{
              'margin-top': 10,
              height: process.platform === 'win32' ? 22 : 35,
            }}
          >
            <IconButton
              src={password() === null ? eyeIcon : eyeOffIcon}
              tooltip={t('previewPassword')}
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
              tooltip={t('showQrCode')}
              size={{ height: 20, width: 20 }}
              imageSize={{ height: 13, width: 13 }}
              style={{ 'margin-top': 0, 'margin-left': 0, 'margin-right': 2 }}
              onClick={() => {
                showQrCode(props.window);
              }}
            />
            <IconButton
              src={clipboardIcon}
              tooltip={t('copyPassword')}
              size={{ height: 20, width: 20 }}
              imageSize={{ height: 13, width: 13 }}
              style={{ 'margin-top': 0, 'margin-left': 0, 'margin-right': 2 }}
              onClick={() => {
                copyPassword(props.window);
              }}
            />
          </PreviewLine>
          <PreviewLine
            label={t('tags')}
            value={props.entry.tags}
            style={{ 'margin-top': 10, height: 20 }}
          />
        </container>
        <container style={{ flex: 1, flexDirection: 'column' }}>
          <PreviewLine
            label={t('url')}
            value={props.entry.url}
            style={{ 'margin-top': 10, height: 20 }}
          />
        </container>
      </container>
      <PreviewLine
        label={t('notes')}
        value={props.entry.notes}
        style={{ 'margin-top': 10, flex: 1 }}
        last={true}
      />
    </container>
  );
}

export { PreviewPanel };
