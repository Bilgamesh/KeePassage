import type { Accessor, Setter } from 'solid-js';
import { KeysTable } from '#/components/keys-table';
import { t } from '#/data/i18n';
import type { YubiKey } from '#/schemas/yubikey-schema';
import { open } from '#/utils/url-util';

function DatabaseKeys(props: {
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
      <label
        align="start"
        color="#0000FF"
        cursor="hand"
        onMouseDown={() => {
          open('https://github.com/str4d/age-plugin-yubikey#configuration');
        }}
        style={{ 'margin-left': 10, 'margin-right': 10 }}
        text="https://github.com/str4d/age-plugin-yubikey#configuration"
      />

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
