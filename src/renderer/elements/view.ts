import {
  Container,
  Cursor,
  type CursorType,
  type Font,
  type View as GuiView
} from 'gui';

class View {
  node: GuiView = Container.create();
  protected children: View[] = [];
  parent: View | null = null;
  name: string = 'view';

  protected createElement(): GuiView {
    throw new Error(`Cannot create node "${this.name}" directly.`);
  }

  addChild(child: View, _anchor: View | null | undefined): void {
    throw new Error(
      `Cannot add child node "${child.name}" under parent node "${this.name}". Node type "${this.name}" cannot have children`
    );
  }

  removeChild(child: View): void {
    throw new Error(
      `Cannot remove child node "${child.name}" from parent "${this.name}". Node type "${this.name}" cannot have children`
    );
  }

  getChildren(): View[] {
    return [...this.children];
  }

  setProperty<T>(name: string, value: T): void {
    switch (name) {
      case 'color':
        this.node.setColor(String(value));
        break;
      case 'backgroundColor':
        this.node.setBackgroundColor(String(value));
        break;
      case 'enabled':
        this.node.setEnabled(!!value);
        break;
      case 'cursor':
        this.node.setCursor(Cursor.createWithType(<CursorType>value));
        break;
      case 'focusable':
        this.node.setFocusable(!!value);
        break;
      case 'font':
        this.node.setFont(<Font>value);
        break;
      case 'mouseDownCanMoveWindow':
        this.node.setMouseDownCanMoveWindow(!!value);
        break;
      case 'style':
        this.node.setStyle(<object>value);
        break;
      case 'tooltip':
        this.node.setTooltip(String(value));
        break;
      case 'visible':
        this.node.setVisible(!!value);
        break;
      case 'onCaptureLost':
        this.node.onCaptureLost.connect(value);
        break;
      case 'onDragLeave':
        this.node.onDragLeave.connect(value);
        break;
      case 'onFocusIn':
        this.node.onFocusIn.connect(value);
        break;
      case 'onFocusOut':
        this.node.onFocusOut.connect(value);
        break;
      case 'onKeyDown':
        this.node.onKeyDown.connect(value);
        break;
      case 'onKeyUp':
        this.node.onKeyUp.connect(value);
        break;
      case 'onMouseDown':
        this.node.onMouseDown.connect(value);
        break;
      case 'onMouseEnter':
        this.node.onMouseEnter.connect(value);
        break;
      case 'onMouseLeave':
        this.node.onMouseLeave.connect(value);
        break;
      case 'onMouseMove':
        this.node.onMouseMove.connect(value);
        break;
      case 'onMouseUp':
        this.node.onMouseUp.connect(value);
        break;
      case 'onSizeChanged':
        this.node.onSizeChanged.connect(value);
        break;
      default:
        throw new Error(
          `Property "${name}" is not supported for element type "${this.name}"`
        );
    }
  }
}

export { View };
