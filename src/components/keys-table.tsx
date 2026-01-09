import type { YubiKey } from '@/schemas/yubikey-schema';
import type { TableColumnOptions } from 'gui';
import { SimpleTableModel } from 'gui';
import { Accessor, createEffect, Setter } from 'solid-js';

function KeysTable(props: { yubiKeys: Accessor<YubiKey[]>; setYubiKeys: Setter<YubiKey[]> }) {
  const dbTable = SimpleTableModel.create(4);
  const keys: string[] = [];

  createEffect(() => {
    for (const yubiKey of props.yubiKeys()) {
      if (keys.includes(`${yubiKey.publicKey}`)) {
        continue;
      }
      keys.push(`${yubiKey.publicKey}`);
      dbTable.addRow([`${yubiKey.serial}`, `${yubiKey.slot}`, yubiKey.publicKey, yubiKey.paired]);
    }
  });

  const columns = [
    {
      label: 'Serial number',
      options: {
        type: 'text',
        width: 80
      }
    },
    {
      label: 'Slot',
      options: {
        type: 'text',
        width: 30
      }
    },
    {
      label: 'Public key',
      options: {
        type: 'text',
        width: 400
      }
    },
    {
      label: 'Paired',
      options: {
        type: 'checkbox',
        width: 40
      }
    }
  ] satisfies { label: string; options: TableColumnOptions }[];

  return (
    <container style={{ flex: 1 }}>
      <table
        style={{ flex: 1 }}
        model={dbTable}
        columnsWithOptions={columns}
        hasBorder={true}
        onToggleCheckbox={(table, column, row) => {
          const yubiKey = props.yubiKeys()[row]!;
          yubiKey.paired = !yubiKey.paired;
          props.setYubiKeys((keys) => [...keys]);
        }}
      />
    </container>
  );
}
export { KeysTable };
