import { Button } from '@/renderer/elements/button';
import { Button as GuiButton } from 'gui';

class Radio extends Button {
  override name: string = 'radio';

  protected override createElement() {
    return GuiButton.create({ title: '', type: 'radio' });
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

export { Radio };
