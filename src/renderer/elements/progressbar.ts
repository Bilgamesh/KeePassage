import { ProgressBar as GuiProgressBar } from 'gui';
import { View } from '#/renderer/elements/view';

class ProgressBar extends View {
  override node: GuiProgressBar;
  override name: string = 'progressbar';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return GuiProgressBar.create();
  }

  override setProperty<T>(name: string, value: T) {
    switch (name) {
      case 'value':
        this.node.setValue(<number>value);
        break;
      case 'indeterminate':
        this.node.setIndeterminate(!!value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { ProgressBar };
