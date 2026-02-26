import { Picker as GuiPicker } from 'gui';
import { View } from '@/renderer/elements/view';

class Picker extends View {
  override node: GuiPicker;
  override name: string = 'picker';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return GuiPicker.create();
  }

  override setProperty<T>(name: string, value: T) {
    switch (name) {
      case 'selectedItemIndex':
        this.node.selectItemAt(Number(value));
        break;
      case 'items':
        this.node.clear();
        for (const item of <string[]>value) {
          this.node.addItem(item);
        }
        break;
      case 'onSelectionChange':
        this.node.onSelectionChange.connect(value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { Picker };
