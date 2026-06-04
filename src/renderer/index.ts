import type { Container, Window } from 'gui';
import { createRenderer } from 'solid-js/universal';
import {
  FirstChildNotFoundError,
  InsertNodeError,
  NextSiblingError,
  ParentNotFoundError,
  RemoveNodeError,
  SetPropertyError,
  TextNodeError
} from '#/data/errors';
import { ElementFactory } from '#/renderer/element-factory';
import type { View as ViewWrapper } from '#/renderer/elements/view';

const elementFactory = new ElementFactory();

const renderer = createRenderer({
  createElement(type: string): ViewWrapper | null {
    return elementFactory.createElement(type);
  },
  createTextNode(text: string): ViewWrapper | null {
    if (text === '') return elementFactory.createElement('container');
    throw new TextNodeError(text);
  },
  replaceText(_node: ViewWrapper | null, _text: string): void {},
  insertNode(
    parent: ViewWrapper | null,
    node: ViewWrapper | null,
    anchor: ViewWrapper | null | undefined
  ): void {
    if (node === null) throw new InsertNodeError('null');
    if (parent === null) throw new InsertNodeError(node.name, 'null');
    parent.addChild(node, anchor);
  },
  removeNode(parent: ViewWrapper | null, node: ViewWrapper | null): void {
    if (node === null) throw new RemoveNodeError('null');
    if (parent === null) throw new RemoveNodeError(node.name, 'null');
    parent.removeChild(node);
  },
  setProperty<T>(node: ViewWrapper | null, name: string, value: T): void {
    if (node === null) throw new SetPropertyError(name, 'null');
    node.setProperty(name, value);
  },
  isTextNode(_node: ViewWrapper | null): boolean {
    return false;
  },
  getParentNode(node: ViewWrapper | null): ViewWrapper | null {
    if (node === null) throw new ParentNotFoundError('null');
    return node.parent;
  },
  getFirstChild(node: ViewWrapper | null): ViewWrapper | null {
    if (node === null) throw new FirstChildNotFoundError('null');
    return node.getChildren()[0] || null;
  },
  getNextSibling(node: ViewWrapper | null): ViewWrapper | null {
    if (node === null) throw new NextSiblingError('null');
    if (node.parent === null) throw new NextSiblingError(node.name, 'null');
    let isNextSibling = false;
    for (const child of node.parent.getChildren()) {
      if (isNextSibling) return child;
      if (child === node) isNextSibling = true;
    }
    return null;
  }
});

function render(code: () => ViewWrapper, window: Window): void {
  const node = window.getContentView() as Container;
  if (!node.childCount()) renderer.render(code, elementFactory.wrapNode(node));
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
