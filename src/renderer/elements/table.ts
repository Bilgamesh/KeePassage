import {
  Table as GuiTable,
  type TableColumnOptions,
  type TableModel
} from 'gui';
import { View } from '@/renderer/elements/view';

class Table extends View {
  override node: GuiTable;
  override name: string = 'table';
  private columns: string[] = [];

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return GuiTable.create();
  }

  override setProperty<T>(name: string, value: T): void {
    switch (name) {
      case 'model':
        this.node.setModel(<TableModel>value);
        break;
      case 'columns':
        for (const newColumn of <string[]>value) {
          if (!this.columns.includes(newColumn)) {
            this.columns.push(newColumn);
            this.node.addColumn(newColumn);
          }
        }
        break;
      case 'columnsWithOptions':
        for (const { label, options } of <
          { label: string; options: TableColumnOptions }[]
        >value) {
          if (!this.columns.includes(label)) {
            this.columns.push(label);
            this.node.addColumnWithOptions(label, options);
          }
        }
        break;
      case 'columnsVisible':
        this.node.setColumnsVisible(!!value);
        break;
      case 'rowHeight':
        this.node.setRowHeight(Number(value));
        break;
      case 'hasBorder':
        this.node.setHasBorder(!!value);
        break;
      case 'multipleSelections':
        this.node.enableMultipleSelection(!!value);
        break;
      case 'selectedRow':
        this.node.selectRow(Number(value));
        break;
      case 'selectedRows':
        this.node.selectRows(<number[]>value);
        break;
      case 'onSelectionChange':
        this.node.onSelectionChange.connect(value);
        break;
      case 'onRowActivate':
        this.node.onRowActivate.connect(value);
        break;
      case 'onToggleCheckbox':
        this.node.onToggleCheckbox.connect(value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { Table };
