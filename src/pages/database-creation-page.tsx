import { AttributedText, type Window } from 'gui';
import { createSignal } from 'solid-js';
import yubiKeyImage from '#/assets/img/yubikey.png';
import { DatabaseGeneralInfo } from '#/components/database-general-info';
import { DatabaseKeys } from '#/components/database-keys';
import { Expand } from '#/components/expand';
import { Image } from '#/components/image';
import { Router } from '#/components/router';
import { TITLE_FONT } from '#/data/constants';
import { saveNewDatabase } from '#/data/db-orchestrator';
import { t } from '#/data/i18n';
import { monitorYubiKeys } from '#/data/pcsc-orchestrator';
import type { YubiKey } from '#/schemas/yubikey-schema';

function DatabaseCreationPage(props: { window: Window; mainWindow: Window }) {
  const titles = (index: number) => [t('generalDbInfo'), t('pairKeys')][index];
  const [page, setPage] = createSignal(0);
  const [dbName, setDbName] = createSignal(t('passwords'));
  const [description, setDescription] = createSignal('');
  const [yubiKeys, setYubiKeys] = createSignal([] as YubiKey[]);
  const selectedKeys = () => yubiKeys().filter((key) => key.paired);
  const keyExists = (publicKey?: string) =>
    yubiKeys().find((key) => key.publicKey === publicKey);
  const addKey = (key: YubiKey) => setYubiKeys((keys) => [...keys, key]);

  const cleanup = monitorYubiKeys(
    (key) => {
      if (!keyExists(key.publicKey)) {
        addKey(key);
      }
    },
    { immediate: true }
  );
  props.window.onClose.connect(cleanup);

  return (
    <container style={{ flex: 1 }}>
      <container style={{ flex: 5, flexDirection: 'row', 'margin-top': 20 }}>
        <Image
          size={{ height: 200, width: 200 }}
          src={page() === 1 ? yubiKeyImage : null}
        />
        <container
          style={{
            flex: 1,
            flexDirection: 'column',
            'margin-right': 20
          }}
        >
          <label
            attributedText={AttributedText.create(titles(page()) || '404', {
              font: TITLE_FONT,
              align: 'start'
            })}
            style={{ 'margin-left': 10 }}
          />
          <group style={{ flex: 3 }} title={t('dbCreation')}>
            <Router selectedPageIndex={page}>
              <DatabaseGeneralInfo
                dbName={dbName}
                description={description}
                setDbName={setDbName}
                setDescription={setDescription}
              />
              <DatabaseKeys setYubiKeys={setYubiKeys} yubiKeys={yubiKeys} />
            </Router>
          </group>
          <container
            style={{
              flexDirection: 'row',
              'margin-top': 10,
              'margin-bottom': 10
            }}
          >
            <Expand />
            <button
              enabled={page() !== 0}
              onClick={() => {
                setPage((p) => p - 1);
              }}
              style={{ height: 30, width: 80 }}
              title={t('goBack')}
            />
            <button
              enabled={page() === 0 || selectedKeys().length > 0}
              onClick={() => {
                if (page() !== 1) {
                  setPage((p) => p + 1);
                } else {
                  saveNewDatabase({
                    dbName,
                    description,
                    selectedKeys,
                    window: props.window,
                    mainWindow: props.mainWindow
                  });
                }
              }}
              style={{
                height: 30,
                width: 100,
                'margin-left': 10
              }}
              title={page() !== 1 ? t('continue') : t('save')}
            />
            <button
              onClick={() => {
                props.window.close();
              }}
              style={{ height: 30, width: 60, 'margin-left': 10 }}
              title={t('cancel')}
            />
          </container>
        </container>
      </container>
    </container>
  );
}

export { DatabaseCreationPage };
