import type { Window } from 'gui';
import type { Accessor, Setter } from 'solid-js';
import { t } from '#/data/i18n';
import { render } from '#/renderer';
import type { YubiKey } from '#/schemas/yubikey-schema';
import { KeysTable } from '#/views/components/keys-table';
import { YubiKeyConfigPage } from '#/views/pages/yubikey-config';
import { getYubiKeyConfigWindow } from '#/views/windows/yubikey-config';

function DatabaseKeys(props: {
  window: Window;
  yubiKeys: Accessor<YubiKey[]>;
  setYubiKeys: Setter<YubiKey[]>;
}) {
  return (
    <container style={{ flex: 1 }}>
      <label
        align="start"
        style={{ 'margin-left': 10, 'margin-right': 10 }}
        text={t('pleasePlugInKey')}
      />

      <label
        align="start"
        style={{ 'margin-left': 10, 'margin-right': 10 }}
        text={t('beforeUsingGenerateKey')}
      />
      <container style={{ flexDirection: 'row' }}>
        <label
          align="start"
          color="#0000FF"
          cursor="hand"
          onMouseDown={() => {
            const win = getYubiKeyConfigWindow();
            render(() => <YubiKeyConfigPage window={win} />, win);
            props.window.close();
            win.activate();
          }}
          style={{ 'margin-left': 10, 'margin-right': 10 }}
          text={t('configureYubikey')}
        />
        <container style={{ flex: 1 }} />
      </container>

      <container style={{ flex: 1, margin: 10 }}>
        <label
          align="start"
          style={{ 'margin-bottom': 5 }}
          text={t('detectedKeys')}
        />
        <container style={{ flex: 1, flexDirection: 'row' }}>
          <KeysTable
            setYubiKeys={props.setYubiKeys}
            yubiKeys={props.yubiKeys}
          />
        </container>
      </container>
    </container>
  );
}

export { DatabaseKeys };
