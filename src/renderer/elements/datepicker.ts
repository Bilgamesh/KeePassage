import { DatePicker as GuiDatePicker } from 'gui';

import { View } from '@/renderer/elements/view';

class DatePicker extends View {
  override node: GuiDatePicker;
  override name: string = 'datepicker';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return GuiDatePicker.create({ hasStepper: false });
  }

  override setProperty<T>(name: string, value: T) {
    switch (name) {
      case 'range':
        const { minimum, maximum } = <{ minimum: Date; maximum: Date }>value;
        this.node.setRange(minimum, maximum);
        break;
      case 'date':
        this.node.setDate(<Date>value);
        break;
      case 'onDateChange':
        this.node.onDateChange.connect(value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { DatePicker };
