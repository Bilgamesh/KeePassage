import {
  type ButtonStyle,
  type ControlSize,
  Button as GuiButton,
  type Image,
} from 'gui';
import { View } from '@/renderer/elements/view';

class Button extends View {
  override node: GuiButton;
  override name: string = 'button';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return GuiButton.create('');
  }

  override setProperty<T>(name: string, value: T) {
    switch (name) {
      case 'title':
        this.node.setTitle(String(value));
        break;
      case 'controlSize':
        this.node.setControlSize(<ControlSize>value);
        break;
      case 'hasBorder':
        this.node.setHasBorder(!!value);
        break;
      case 'image':
        this.node.setImage(<Image>value);
        break;
      case 'buttonStyle':
        this.node.setButtonStyle(<ButtonStyle>value);
        break;
      case 'onClick':
        this.node.onClick.connect(value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { Button };
