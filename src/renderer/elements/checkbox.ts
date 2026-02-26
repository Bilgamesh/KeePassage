import { Button as GuiButton } from 'gui';
import { Button } from '@/renderer/elements/button';

class Checkbox extends Button {
  override name: string = 'checkbox';

  protected override createElement() {
    return GuiButton.create({ title: '', type: 'checkbox' });
  }

  override setProperty<T>(name: string, value: T) {
    switch (name) {
      case 'checked':
        this.node.setChecked(!!value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { Checkbox };
