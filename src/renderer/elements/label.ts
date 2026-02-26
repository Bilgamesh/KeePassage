import { type AttributedText, Label as GuiLabel, type TextAlign } from 'gui';
import { View } from '@/renderer/elements/view';

class Label extends View {
  override node: GuiLabel;
  override name: string = 'label';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return GuiLabel.create('');
  }

  override setProperty<T>(name: string, value: T) {
    switch (name) {
      case 'text':
        this.node.setText(String(value));
        break;
      case 'attributedText':
        this.node.setAttributedText(<AttributedText>value);
        break;
      case 'align':
        this.node.setAlign(<TextAlign>value);
        break;
      case 'vAlign':
        this.node.setVAlign(<TextAlign>value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { Label };
