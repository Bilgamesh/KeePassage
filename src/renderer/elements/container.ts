import { Container as GuiContainer, Scroll } from 'gui';
import {
  AnchorNodeNotFoundError,
  ChildNodeNotFoundError,
  NodeParentConflictError
} from '#/data/errors';
import { View } from '#/renderer/elements/view';

class Container extends View {
  override node: GuiContainer;
  override name: string = 'container';

  constructor() {
    super();
    this.node = this.createElement();
    this.wireParentResize();
  }

  protected override createElement() {
    return GuiContainer.create();
  }

  private wireParentResize() {
    this.node.onSizeChanged.connect(() => {
      if (this.parent?.node instanceof Scroll)
        this.parent.node.setContentSize(this.node.getPreferredSize());
    });
  }

  override addChild(child: View, anchor: View | null | undefined): void {
    if (child.parent !== null)
      throw new NodeParentConflictError(
        child.name,
        this.name,
        child.parent.name
      );

    if (!anchor) {
      this.node.addChildView(child.node);
      this.children.push(child);
      child.parent = this;
    } else {
      const anchorIndex = this.children.indexOf(anchor);
      if (anchorIndex === -1)
        throw new AnchorNodeNotFoundError(child.name, this.name, anchor.name);
      this.node.addChildViewAt(child.node, anchorIndex);
      this.children.splice(anchorIndex, 0, child);
      child.parent = this;
    }
  }

  override removeChild(child: View): void {
    this.node.removeChildView(child.node);
    const index = this.children.indexOf(child);
    if (index === -1) throw new ChildNodeNotFoundError(child.name, this.name);
    this.children.splice(index, 1);
    child.parent = null;
  }

  override setProperty<T>(name: string, value: T): void {
    switch (name) {
      case 'onDraw':
        this.node.onDraw.connect(value);
        break;
      default:
        super.setProperty(name, value);
        break;
    }
  }
}

export { Container };
