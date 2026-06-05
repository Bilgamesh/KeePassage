import {
  Container,
  Scroll as GuiScroll,
  type ScrollElasticity,
  type ScrollPolicy,
  type SizeF
} from 'gui';
import {
  NodeParentConflictError,
  ParentNodeChildLimitExceededError
} from '#/data/errors';
import { View } from '#/renderer/elements/view';

const EMPTY_CHILD = Container.create();

class Scroll extends View {
  override node: GuiScroll;
  override name: string = 'scroll';

  constructor() {
    super();
    this.node = this.createElement();
  }

  protected override createElement() {
    const element = GuiScroll.create();
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
      throw new ParentNodeChildLimitExceededError(child.name, this.name);
    this.node?.setContentView(child.node!);
    this.children[0] = child;
    child.parent = this;
  }

  override removeChild(child: View): void {
    this.node?.setContentView(EMPTY_CHILD);
    this.children.length = 0;
    child.parent = null;
  }

  override setProperty<T>(name: string, value: T) {
    switch (name) {
      case 'contentSize':
        this.node?.setContentSize(value as SizeF);
        break;
      case 'scrollPosition': {
        const { horizon, vertical } = value as {
          horizon: number;
          vertical: number;
        };
        this.node?.setScrollPosition(horizon, vertical);
        break;
      }
      case 'overlayScrollbar':
        this.node?.setOverlayScrollbar(!!value);
        break;
      case 'scrollbarPolicy': {
        const { hpolicy, vpolicy } = value as {
          hpolicy: ScrollPolicy;
          vpolicy: ScrollPolicy;
        };
        this.node?.setScrollbarPolicy(hpolicy, vpolicy);
        break;
      }
      case 'scrollElasticity': {
        const { helasticity, velasticity } = value as {
          helasticity: ScrollElasticity;
          velasticity: ScrollElasticity;
        };
        this.node?.setScrollElasticity(helasticity, velasticity);
        break;
      }
      case 'onScroll':
        this.node?.onScroll.connect(value);
        break;
      default:
        super.setProperty<T>(name, value);
        break;
    }
  }
}

export { Scroll };
