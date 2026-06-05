import { Container, Group as GuiGroup } from 'gui';
import {
  InvalidChildNodeTypeError,
  MaxChildrenExceededError,
  NodeParentConflictError
} from '#/data/errors';
import { View } from '#/renderer/elements/view';

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

  override addChild(child: View, _anchor: View | null | undefined): void {
    if (child.parent !== null)
      throw new NodeParentConflictError(
        child.name,
        this.name,
        child.parent.name
      );
    if (this.children.length > 0)
      throw new MaxChildrenExceededError(child.name, this.name);
    if (!(child.node instanceof Container))
      throw new InvalidChildNodeTypeError(child.name, this.name, 'Container');
    this.children[0] = child;
    this.node?.setContentView(child.node);
    child.parent = this;
  }

  override removeChild(child: View): void {
    this.children.length = 0;
    this.node?.setContentView(EMPTY_CHILD);
    child.parent = null;
  }

  override setProperty<T>(name: string, value: T) {
    switch (name) {
      case 'title':
        this.node?.setTitle(String(value));
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { Group };
