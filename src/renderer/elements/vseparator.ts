import { View } from '@/renderer/elements/view';
import { Separator } from 'gui';

class VSeparator extends View {
  override node: Separator;
  override name: string = 'separator';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return Separator.create('vertical');
  }

  override setProperty<T>(name: string, value: T) {
    super.setProperty<T>(name, value);
  }
}

export { VSeparator };
