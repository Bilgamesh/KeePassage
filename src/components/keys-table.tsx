import type { TableColumnOptions } from 'gui';
import { SimpleTableModel } from 'gui';
import { type Accessor, createEffect, type Setter } from 'solid-js';
import { t } from '#/data/i18n';
import type { YubiKey } from '#/schemas/yubikey-schema';

function KeysTable(props: {
  yubiKeys: Accessor<YubiKey[]>;
  setYubiKeys: Setter<YubiKey[]>;
}) {
  const dbTable = SimpleTableModel.create(4);
  const keys: string[] = [];

  createEffect(() => {
    for (const yubiKey of props.yubiKeys()) {
      if (keys.includes(`${yubiKey.publicKey}`)) {
        continue;
      }
      keys.push(`${yubiKey.publicKey}`);
      dbTable.addRow([
        `${yubiKey.serial}`,
        `${yubiKey.slot}`,
        yubiKey.publicKey,
        yubiKey.paired
      ]);
    }
  });

  const columns = [
    {
      label: t('serialNumber'),
      options: {
        type: 'text',
        width: 90
      }
    },
    {
      label: t('slot'),
      options: {
        type: 'text',
        width: 30
      }
    },
    {
      label: t('publicKey'),
      options: {
        type: 'text',
        width: 350
      }
    },
    {
      label: t('paired'),
      options: {
        type: 'checkbox',
        width: 70
      }
    }
  ] satisfies { label: string; options: TableColumnOptions }[];

  return (
    <container style={{ flex: 1 }}>
      <table
        columnsWithOptions={columns}
        hasBorder={true}
        model={dbTable}
        onToggleCheckbox={(_table, _column, row) => {
          const yubiKey = props.yubiKeys()[row]!;
          yubiKey.paired = !yubiKey.paired;
          props.setYubiKeys((keys) => [...keys]);
        }}
        style={{ flex: 1 }}
      />
    </container>
  );
}
export { KeysTable };
