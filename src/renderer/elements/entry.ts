import { Entry as GuiEntry } from 'gui';

import { View } from '@/renderer/elements/view';

class Entry extends View {
  override node: GuiEntry;
  override name: string = 'entry';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return GuiEntry.create();
  }

  override setProperty<T>(name: string, value: T) {
    switch (name) {
      case 'text':
        this.node.setText(String(value));
        break;
      case 'onTextChange':
        this.node.onTextChange.connect(value);
        break;
      case 'onActivate':
        this.node.onActivate.connect(value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { Entry };
