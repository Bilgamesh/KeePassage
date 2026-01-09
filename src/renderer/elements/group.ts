import { View } from '@/renderer/elements/view';
import { Container, Group as GuiGroup } from 'gui';

const EMPTY_CHILD = Container.create();

class Group extends View {
  override node: GuiGroup;
  override name: string = 'group';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    const element = GuiGroup.create('');
    element.setContentView(EMPTY_CHILD);
    return element;
  }

  override addChild(child: View, anchor: View | null | undefined): void {
    if (child.parent !== null) {
      throw new Error(
        `Cannot add child node "${child.name}" under parent node "${this.name}". Node "${child.name}" already has another parent node ${child.parent.name}.`
      );
    }
    if (this.children.length > 0) {
      throw new Error(
        `Cannot add child node "${child.name}" under parent node "${this.name}". Parent node "${this.name}" cannot have more than 1 child node.`
      );
    }
    if (!(child.node instanceof Container)) {
      throw new Error(
        `Cannot add child node "${child.name}" under parent node "${this.name}". Parent node "${this.name}" only acceps child with node type container.`
      );
    }
    this.children[0] = child;
    this.node.setContentView(child.node);
    child.parent = this;
  }

  override removeChild(child: View): void {
    this.children.length = 0;
    this.node.setContentView(EMPTY_CHILD);
    child.parent = null;
  }

  override setProperty<T>(name: string, value: T) {
    switch (name) {
      case 'title':
        this.node.setTitle(String(value));
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { Group };
