import {
  Browser,
  Button,
  ComboBox,
  Container,
  DatePicker,
  Entry,
  GifPlayer,
  Group,
  Label,
  Picker,
  ProgressBar,
  Scroll,
  Separator,
  Slider,
  Tab,
  Table,
  TextEdit,
  Vibrant,
  type View
} from 'gui';
import { Browser as BrowserWrapper } from '#/renderer/elements/browser';
import { Button as ButtonWrapper } from '#/renderer/elements/button';
import { Checkbox as CheckboxWrapper } from '#/renderer/elements/checkbox';
import { ComboBox as ComboBoxWrapper } from '#/renderer/elements/combobox';
import { Container as ContainerWrapper } from '#/renderer/elements/container';
import { DatePicker as DatePickerWrapper } from '#/renderer/elements/datepicker';
import { Entry as EntryWrapper } from '#/renderer/elements/entry';
import { GifPlayer as GifPlayerWrapper } from '#/renderer/elements/gifplayer';
import { Group as GroupWrapper } from '#/renderer/elements/group';
import { HSeparator as HSeparatorWrapper } from '#/renderer/elements/hseparator';
import { Label as LabelWrapper } from '#/renderer/elements/label';
import { Password as PasswordWrapper } from '#/renderer/elements/password';
import { Picker as PickerWrapper } from '#/renderer/elements/picker';
import { ProgressBar as ProgressBarWrapper } from '#/renderer/elements/progressbar';
import { Radio as RadioWrapper } from '#/renderer/elements/radio';
import { Scroll as ScrollWrapper } from '#/renderer/elements/scroll';
import { Slider as SliderWrapper } from '#/renderer/elements/slider';
import { Tab as TabWrapper } from '#/renderer/elements/tab';
import { Table as TableWrapper } from '#/renderer/elements/table';
import { TextEdit as TextEditWrapper } from '#/renderer/elements/textedit';
import { Vibrant as VibrantWrapper } from '#/renderer/elements/vibrant';
import type { View as ViewWrapper } from '#/renderer/elements/view';
import { VSeparator as VSeparatorWrapper } from '#/renderer/elements/vseparator';

class ElementFactory {
  types: {
    name: string;
    type: typeof ViewWrapper;
    guiType: typeof View;
  }[] = [];

  constructor() {
    this.registerType('label', LabelWrapper, Label);
    this.registerType('container', ContainerWrapper, Container);
    this.registerType('button', ButtonWrapper, Button);
    this.registerType('datepicker', DatePickerWrapper, DatePicker);
    this.registerType('picker', PickerWrapper, Picker);
    this.registerType('combobox', ComboBoxWrapper, ComboBox);
    this.registerType('entry', EntryWrapper, Entry);
    this.registerType('password', PasswordWrapper, Entry);
    this.registerType('gifplayer', GifPlayerWrapper, GifPlayer);
    this.registerType('group', GroupWrapper, Group);
    this.registerType('progressbar', ProgressBarWrapper, ProgressBar);
    this.registerType('scroll', ScrollWrapper, Scroll);
    this.registerType('vseparator', VSeparatorWrapper, Separator);
    this.registerType('hseparator', HSeparatorWrapper, Separator);
    this.registerType('slider', SliderWrapper, Slider);
    this.registerType('tab', TabWrapper, Tab);
    this.registerType('table', TableWrapper, Table);
    this.registerType('textedit', TextEditWrapper, TextEdit);
    this.registerType('vibrant', VibrantWrapper, Vibrant);
    this.registerType('checkbox', CheckboxWrapper, Button);
    this.registerType('radio', RadioWrapper, Button);
    this.registerType('browser', BrowserWrapper, Browser);
  }

  registerType(name: string, type: typeof ViewWrapper, guiType: typeof View) {
    this.types.push({ name, type, guiType });
  }

  createElement(type: string): ViewWrapper {
    for (const registeredType of this.types) {
      if (registeredType.name === type) {
        return new registeredType.type();
      }
    }
    throw new Error(
      `Cannot create element type ${type}. Type ${type} is not implemented.`
    );
  }

  wrapNode(node: View) {
    for (const { guiType, name } of this.types) {
      if (node instanceof guiType) {
        const element = this.createElement(name);
        element.node = node;
        return element;
      }
    }
    return null;
  }
}

export { ElementFactory };
