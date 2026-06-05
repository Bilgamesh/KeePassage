import { SimpleTableModel, type TableColumnOptions } from 'gui';
import type { Accessor } from 'solid-js';
import { getTranslator } from '#/data/i18n';
import { useAppContext } from '#/data/shared-state';
import type { Slot } from '#/service/yubikey';

function YubiKeyConfigTable(props: {
  slots: Accessor<Slot[]>;
  onSelection?: (slot: Slot | null) => void;
}) {
  const state = useAppContext();
  const t = getTranslator(state);

  const columns = [
    {
      label: t('serialNumber'),
      options: {
        type: 'text',
        width: 90
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
      label: t('slot'),
      options: {
        type: 'text',
        width: -1
      }
    }
  ] satisfies { label: string; options: TableColumnOptions }[];

  const model = () => {
    const model = SimpleTableModel.create(3);
    for (const slot of props.slots())
      model.addRow([`${slot.serial}`, slot.publicKey ?? '', slot.name]);
    return model;
  };

  return (
    <container style={{ flex: 1 }}>
      <table
        columnsWithOptions={columns}
        hasBorder={true}
        model={model()}
        multipleSelections={false}
        onSelectionChange={(table) => {
          const row = table.getSelectedRow();
          if (props.onSelection) props.onSelection(props.slots()[row] ?? null);
        }}
        style={{ flex: 1 }}
      />
    </container>
  );
}

export { YubiKeyConfigTable };
