import { Accessor, Setter } from 'solid-js';

import { KeysTable } from '@/components/keys-table';
import type { YubiKey } from '@/schemas/yubikey-schema';
import { open } from '@/utils/url-util';

function DatabaseKeys(props: { yubiKeys: Accessor<YubiKey[]>; setYubiKeys: Setter<YubiKey[]> }) {
  return (
    <container style={{ flex: 1 }}>
      <label
        text='Please plug in the YubiKey keys you would like to pair with this database and tick the "Paired" checkbox.\nIt is recommended to add at least two keys, so that one can serve as a backup.'
        align="start"
        style={{ 'margin-left': 10, 'margin-right': 10 }}
      />

      <label
        text="Before using a YubiKey with this program, you need to generate an ECDSA P-256 key in the PIV applet.\nYou can follow this guide:"
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
        <label text="Detected keys" align="start" style={{ 'margin-bottom': 5 }} />
        <container style={{ flex: 1, flexDirection: 'row' }}>
          <KeysTable yubiKeys={props.yubiKeys} setYubiKeys={props.setYubiKeys} />
        </container>
      </container>
    </container>
  );
}

export { DatabaseKeys };
