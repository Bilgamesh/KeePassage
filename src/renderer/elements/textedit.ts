import { View } from '@/renderer/elements/view';
import { type ScrollElasticity, type ScrollPolicy, TextEdit as GuiTextEdit } from 'gui';

class TextEdit extends View {
  override node: GuiTextEdit;
  override name: string = 'textedit';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return GuiTextEdit.create();
  }

  override setProperty<T>(name: string, value: T): void {
    switch (name) {
      case 'text':
        this.node.setText(String(value));
        break;
      case 'selectedRange':
        const { start, end } = <{ start: number; end: number }>value;
        this.node.selectRange(start, end);
        break;
      case 'scrollbarPolicy':
        const { hpolicy, vpolicy } = <{ hpolicy: ScrollPolicy; vpolicy: ScrollPolicy }>value;
        this.node.setScrollbarPolicy(hpolicy, vpolicy);
        break;
      case 'scrollElasticity':
        const { helasticity, velasticity } = <
          { helasticity: ScrollElasticity; velasticity: ScrollElasticity }
        >value;
        this.node.setScrollElasticity(helasticity, velasticity);
        break;
      case 'onTextChange':
        this.node.onTextChange.connect(value);
        break;
      case 'shouldInsertNewLine':
        this.node.shouldInsertNewLine = <(self: GuiTextEdit) => boolean>value;
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { TextEdit };
