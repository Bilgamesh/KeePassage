import {
  Vibrant as GuiVibrant,
  type VibrantBlendingMode,
  type VibrantMaterial
} from 'gui';
import { Container } from '@/renderer/elements/container';

class Vibrant extends Container {
  override node: GuiVibrant;
  override name: string = 'vibrant';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    if (process.platform !== 'darwin') {
      throw new Error(
        'Cannot create element "vibrant". This element is only supported on macOS.'
      );
    }
    return GuiVibrant.create();
  }

  override setProperty<T>(name: string, value: T): void {
    switch (name) {
      case 'material':
        this.node.setMaterial(<VibrantMaterial>value);
        break;
      case 'blendingMode':
        this.node.setBlendingMode(<VibrantBlendingMode>value);
        break;
      default:
        super.setProperty(name, value);
        break;
    }
  }
}

export { Vibrant };
