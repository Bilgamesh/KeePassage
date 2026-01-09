import { View } from '@/renderer/elements/view';
import { Separator } from 'gui';

class HSeparator extends View {
  override node: Separator;
  override name: string = 'separator';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return Separator.create('horizontal');
  }

  override setProperty<T>(name: string, value: T) {
    super.setProperty<T>(name, value);
  }
}

export { HSeparator };
