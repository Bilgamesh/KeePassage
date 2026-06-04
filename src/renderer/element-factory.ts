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
import { TypeNotImplementedError } from '#/data/errors';
import { Browser as BrowserWrapper } from '#/renderer/elements/browser';
import { Button as ButtonWrapper } from '#/renderer/elements/button';
import { Checkbox as CheckboxWrapper } from '#/renderer/elements/checkbox';
import { ComboBox as ComboBoxWrapper } from '#/renderer/elements/combobox';
import { Container as ContainerWrapper } from '#/renderer/elements/container';
import { DatePicker as DPWrapper } from '#/renderer/elements/datepicker';
import { Entry as EntryWrapper } from '#/renderer/elements/entry';
import { GifPlayer as GifPlayerWrapper } from '#/renderer/elements/gifplayer';
import { Group as GroupWrapper } from '#/renderer/elements/group';
import { HSeparator as HSeparatorWrapper } from '#/renderer/elements/hseparator';
import { Label as LabelWrapper } from '#/renderer/elements/label';
import { Password as PasswordWrapper } from '#/renderer/elements/password';
import { Picker as PickerWrapper } from '#/renderer/elements/picker';
import { ProgressBar as PBWrapper } from '#/renderer/elements/progressbar';
import { Radio as RadioWrapper } from '#/renderer/elements/radio';
import { Scroll as ScrollWrapper } from '#/renderer/elements/scroll';
import { Slider as SliderWrapper } from '#/renderer/elements/slider';
import { Tab as TabWrapper } from '#/renderer/elements/tab';
import { Table as TableWrapper } from '#/renderer/elements/table';
import { TextEdit as TextEditWrapper } from '#/renderer/elements/textedit';
import { Vibrant as VibrantWrapper } from '#/renderer/elements/vibrant';
import type { View as ViewWrapper } from '#/renderer/elements/view';
import { VSeparator as VSeparatorWrapper } from '#/renderer/elements/vseparator';

type Create = () => ViewWrapper;
type Constructor = {
  elementName: string;
  create: Create;
  nodeType: typeof View;
};

class ElementFactory {
  constructors: Constructor[] = [];

  constructor() {
    this.addConstructor('label', () => new LabelWrapper(), Label);
    this.addConstructor('container', () => new ContainerWrapper(), Container);
    this.addConstructor('button', () => new ButtonWrapper(), Button);
    this.addConstructor('datepicker', () => new DPWrapper(), DatePicker);
    this.addConstructor('picker', () => new PickerWrapper(), Picker);
    this.addConstructor('combobox', () => new ComboBoxWrapper(), ComboBox);
    this.addConstructor('entry', () => new EntryWrapper(), Entry);
    this.addConstructor('password', () => new PasswordWrapper(), Entry);
    this.addConstructor('gifplayer', () => new GifPlayerWrapper(), GifPlayer);
    this.addConstructor('group', () => new GroupWrapper(), Group);
    this.addConstructor('progressbar', () => new PBWrapper(), ProgressBar);
    this.addConstructor('scroll', () => new ScrollWrapper(), Scroll);
    this.addConstructor('vseparator', () => new VSeparatorWrapper(), Separator);
    this.addConstructor('hseparator', () => new HSeparatorWrapper(), Separator);
    this.addConstructor('slider', () => new SliderWrapper(), Slider);
    this.addConstructor('tab', () => new TabWrapper(), Tab);
    this.addConstructor('table', () => new TableWrapper(), Table);
    this.addConstructor('textedit', () => new TextEditWrapper(), TextEdit);
    this.addConstructor('vibrant', () => new VibrantWrapper(), Vibrant);
    this.addConstructor('checkbox', () => new CheckboxWrapper(), Button);
    this.addConstructor('radio', () => new RadioWrapper(), Button);
    this.addConstructor('browser', () => new BrowserWrapper(), Browser);
  }

  private addConstructor(
    elementName: string,
    create: Create,
    nodeType: typeof View
  ) {
    this.constructors.push({ elementName, create, nodeType });
  }

  createElement(type: string): ViewWrapper {
    for (const { elementName, create } of this.constructors)
      if (elementName === type) return create();
    throw new TypeNotImplementedError(type);
  }

  wrapNode(node: View) {
    for (const { nodeType, elementName } of this.constructors)
      if (node instanceof nodeType) {
        const element = this.createElement(elementName);
        element.node = node;
        return element;
      }
    return null;
  }
}

export { ElementFactory };
