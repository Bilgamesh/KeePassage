import type { Accessor, Setter } from 'solid-js';
import { KeysTable } from '@/components/keys-table';
import { t } from '@/data/i18n';
import type { YubiKey } from '@/schemas/yubikey-schema';
import { open } from '@/utils/url-util';

function DatabaseKeys(props: {
  yubiKeys: Accessor<YubiKey[]>;
  setYubiKeys: Setter<YubiKey[]>;
}) {
  return (
    <container style={{ flex: 1 }}>
      <label
        text={t('pleasePlugInKey')}
        align="start"
        style={{ 'margin-left': 10, 'margin-right': 10 }}
      />

      <label
        text={t('beforeUsingGenerateKey')}
        align="start"
        style={{ 'margin-left': 10, 'margin-right': 10 }}
      />
      <label
        text="https://github.com/str4d/age-plugin-yubikey#configuration"
        align="start"
        color="#0000FF"
        onMouseDown={() => {
          open('https://github.com/str4d/age-plugin-yubikey#configuration');
        }}
        cursor="hand"
        style={{ 'margin-left': 10, 'margin-right': 10 }}
      />

      <container style={{ flex: 1, margin: 10 }}>
        <label
          text={t('detectedKeys')}
          align="start"
          style={{ 'margin-bottom': 5 }}
        />
        <container style={{ flex: 1, flexDirection: 'row' }}>
          <KeysTable
            yubiKeys={props.yubiKeys}
            setYubiKeys={props.setYubiKeys}
          />
        </container>
      </container>
    </container>
  );
}

export { DatabaseKeys };
