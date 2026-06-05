import { Tab as GuiTab } from 'gui';
import { ChildNodeNotFoundError, NodeParentConflictError } from '#/data/errors';
import { View } from '#/renderer/elements/view';

class Tab extends View {
  override node: GuiTab;
  override name: string = 'tab';
  titles: string[] | null = null;
  queue: View[] = [];

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    return GuiTab.create();
  }

  override addChild(child: View, _anchor: View | null | undefined): void {
    if (child.parent !== null)
      throw new NodeParentConflictError(
        child.name,
        this.name,
        child.parent.name
      );
    if (this.titles) {
      if (this.queue.length > 0) this.addFromQueue();
      this.children.push(child);
      this.node?.addPage(this.titles[this.children.length] || '', child.node!);
    } else {
      this.queue.push(child);
    }
    child.parent = this;
  }

  private addFromQueue() {
    for (const [index, child] of this.queue.entries()) {
      this.children.push(child);
      this.node?.addPage(this.titles?.[index] || '', child.node!);
    }
    this.queue.length = 0;
  }

  override removeChild(child: View): void {
    const index = this.children.indexOf(child);
    if (index === -1) throw new ChildNodeNotFoundError(child.name, this.name);
    this.node?.removePage(child.node!);
    this.children.splice(index, 1);
    child.parent = null;
  }

  override setProperty<T>(name: string, value: T): void {
    switch (name) {
      case 'titles':
        this.titles = value as string[];
        this.addFromQueue();
        break;
      case 'selectedPage':
        this.node?.selectPageAt(Number(value));
        break;
      case 'onSelectedPageChange':
        this.node?.onSelectedPageChange.connect(value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { Tab };
