import type { Container, Window } from 'gui';
import { createRenderer } from 'solid-js/universal';
import { ElementFactory } from '@/renderer/element-factory';
import type { View as ViewWrapper } from '@/renderer/elements/view';

const elementFactory = new ElementFactory();

const renderer = createRenderer({
  createElement(type: string): ViewWrapper | null {
    return elementFactory.createElement(type);
  },
  createTextNode(text: string): ViewWrapper | null {
    if (text === '') {
      return elementFactory.createElement('container');
    }
    throw new Error(
      `Cannot add node "${text}". Text nodes are not supported. Try <label text="${text.replaceAll('"', '\\"')}" /> instead.`
    );
  },
  replaceText(_node: ViewWrapper | null, _text: string): void {},
  insertNode(
    parent: ViewWrapper | null,
    node: ViewWrapper | null,
    anchor: ViewWrapper | null | undefined
  ): void {
    if (node === null) {
      throw new Error('Cannot insert node "null".');
    }
    if (parent === null) {
      throw new Error(`Cannot insert node "${node.name}" into parent "null".`);
    }
    parent.addChild(node, anchor);
  },
  removeNode(parent: ViewWrapper | null, node: ViewWrapper | null): void {
    if (node === null) {
      throw new Error('Cannot remove node "null".');
    }
    if (parent === null) {
      throw new Error(`Cannot remove node "${node.name}" from parent "null".`);
    }
    parent.removeChild(node);
  },
  setProperty<T>(node: ViewWrapper | null, name: string, value: T): void {
    if (node === null) {
      throw new Error(`Cannot set property "${name}" of node "null".`);
    }
    node.setProperty(name, value);
  },
  isTextNode(_node: ViewWrapper | null): boolean {
    return false;
  },
  getParentNode(node: ViewWrapper | null): ViewWrapper | null {
    if (node === null) {
      throw new Error('Cannot find parent of node "null".');
    }
    return node.parent;
  },
  getFirstChild(node: ViewWrapper | null): ViewWrapper | null {
    if (node === null) {
      throw new Error('Cannot get first child of node "null".');
    }
    return node.getChildren()[0] || null;
  },
  getNextSibling(node: ViewWrapper | null): ViewWrapper | null {
    if (node === null) {
      throw new Error('Cannot get next sibling of node "null".');
    }
    if (node.parent === null) {
      throw new Error(
        `Cannot get next sibling of node "${node.name}" with parent "null".`
      );
    }
    let isNextSibling = false;
    for (const child of node.parent.getChildren()) {
      if (isNextSibling) {
        return child;
      }
      if (child === node) {
        isNextSibling = true;
      }
    }
    return null;
  }
});

function render(code: () => ViewWrapper, window: Window): void {
  const node = window.getContentView() as Container;
  if (!node.childCount()) {
    renderer.render(code, elementFactory.wrapNode(node));
  }
}

export {
  ErrorBoundary,
  For,
  Index,
  Match,
  Show,
  Suspense,
  SuspenseList,
  Switch
} from 'solid-js';

export const {
  effect,
  memo,
  createComponent,
  createElement,
  createTextNode,
  insertNode,
  insert,
  spread,
  setProp,
  mergeProps,
  use
} = renderer;

export { render };
