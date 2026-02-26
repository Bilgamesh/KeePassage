import { Slider as GuiSlider } from 'gui';
import { View } from '@/renderer/elements/view';

class Slider extends View {
  override node: GuiSlider;
  override name: string = 'slider';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return GuiSlider.create();
  }

  override setProperty<T>(name: string, value: T): void {
    switch (name) {
      case 'value':
        this.node.setValue(Number(value));
        break;
      case 'step':
        this.node.setStep(Number(value));
        break;
      case 'range': {
        const { min, max } = <{ min: number; max: number }>value;
        this.node.setRange(min, max);
        break;
      }
      case 'onValueChange':
        this.node.onValueChange.connect(value);
        break;
      case 'onSlidingComplete':
        this.node.onSlidingComplete.connect(value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { Slider };
