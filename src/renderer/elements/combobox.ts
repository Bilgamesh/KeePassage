import { ComboBox as GuiComboBox } from 'gui';
import { Picker } from '@/renderer/elements/picker';

class ComboBox extends Picker {
  override node: GuiComboBox;
  override name: string = 'combobox';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return GuiComboBox.create();
  }

  override setProperty<T>(name: string, value: T) {
    switch (name) {
      case 'text':
        this.node.setText(String(value));
        break;
      case 'onTextChange':
        this.node.onTextChange.connect(value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { ComboBox };
