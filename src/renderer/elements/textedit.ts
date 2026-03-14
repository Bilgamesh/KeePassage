import {
  TextEdit as GuiTextEdit,
  type ScrollElasticity,
  type ScrollPolicy
} from 'gui';
import { View } from '#/renderer/elements/view';

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
        if (this.node.getText() !== value) {
          this.node.setText(String(value));
        }
        break;
      case 'selectedRange': {
        const { start, end } = value as { start: number; end: number };
        this.node.selectRange(start, end);
        break;
      }
      case 'scrollbarPolicy': {
        const { hpolicy, vpolicy } = value as {
          hpolicy: ScrollPolicy;
          vpolicy: ScrollPolicy;
        };
        this.node.setScrollbarPolicy(hpolicy, vpolicy);
        break;
      }
      case 'scrollElasticity': {
        const { helasticity, velasticity } = value as {
          helasticity: ScrollElasticity;
          velasticity: ScrollElasticity;
        };
        this.node.setScrollElasticity(helasticity, velasticity);
        break;
      }
      case 'onTextChange':
        this.node.onTextChange.connect(value);
        break;
      case 'shouldInsertNewLine':
        this.node.shouldInsertNewLine = value as (self: GuiTextEdit) => boolean;
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { TextEdit };
