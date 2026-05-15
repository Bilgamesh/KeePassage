import { randomUUID, type UUID } from 'node:crypto';
import type { Container, View } from 'gui';
import {
  type Accessor,
  children,
  createEffect,
  createSignal,
  on,
  type Setter
} from 'solid-js';
import type { View as ViewWrapper } from '#/renderer/elements/view';

type cleanup = (() => void) | null;
type historyItem = {
  index: number;
  id: UUID;
  cleanup: cleanup;
};
type pageSelector<T extends Record<string, number>> = (
  pages: T
) => number | Omit<historyItem, 'id'>;
type pageChecker<T extends Record<string, number>> = (
  pages: T
) => number | number[];

class Navigator<T extends Record<string, number>> {
  private history: Accessor<historyItem[]>;
  private setHistory: Setter<historyItem[]>;
  public pageIndex: Accessor<number>;
  private setPageIndex: Setter<number>;
  private indexes: T;

  constructor(indexes: T) {
    const [pageIndex, setPageIndex] = createSignal(0);
    const [history, setHistory] = createSignal<historyItem[]>([
      {
        index: pageIndex(),
        id: randomUUID(),
        cleanup: null
      }
    ]);
    this.history = history;
    this.setHistory = setHistory;
    this.pageIndex = pageIndex;
    this.setPageIndex = setPageIndex;
    this.indexes = indexes;
  }

  push(pageSelector: pageSelector<T>) {
    const input = pageSelector(this.indexes);
    const { index, cleanup } =
      typeof input === 'number' ? { index: input } : (input as historyItem);
    this.setHistory((history) => [
      ...history,
      { index, id: randomUUID(), cleanup: cleanup ?? null }
    ]);
    this.setPageIndex(index);
  }

  replace(options: { from?: pageChecker<T>; to: pageSelector<T> }): void {
    const input = options.to(this.indexes);
    const from = options.from ? options.from(this.indexes) : null;

    if (Array.isArray(from) && from.includes(this.pageIndex())) {
      this.replace({ to: options.to });
      return;
    }
    if (from === this.pageIndex()) {
      this.replace({ to: options.to });
      return;
    }
    if (from !== null) return;

    const { index, cleanup } =
      typeof input === 'number' ? { index: input } : (input as historyItem);

    for (const item of this.history().reverse())
      if (item.cleanup) item.cleanup();

    this.setHistory([{ index, id: randomUUID(), cleanup: cleanup ?? null }]);
    this.setPageIndex(index);
  }

  pop() {
    if (this.history().length < 2) return;
    const lastItem = this.history()[this.history().length - 1]!;
    if (lastItem.cleanup) lastItem.cleanup();
    this.setHistory((history) => [...history.slice(0, -1)]);
    const { index } = this.history()[this.history().length - 1]!;
    this.setPageIndex(index);
  }

  subscribe(callback: (page: number) => void) {
    createEffect(on(this.pageIndex, (value) => callback(value)));
  }

  isCurrentPage(pageChecker: pageChecker<T>) {
    const index = pageChecker(this.indexes);
    if (typeof index === 'number') return this.pageIndex() === index;
    return index.includes(this.pageIndex());
  }
}

function Router<T extends Record<string, number>>(props: {
  children: View[];
  navigator: Navigator<T>;
}): View[] {
  const pages: ViewWrapper[] = children(() => props.children).toArray();
  let container: Container;

  createEffect(() => {
    const previousPage =
      container.childCount() > 0 ? container.childAt(0) : null;
    const nextPage = pages[props.navigator.pageIndex()]?.node || null;
    if (previousPage) {
      previousPage.setVisible(false);
      container.removeChildView(previousPage);
    }
    if (nextPage) {
      container.addChildView(nextPage);
      nextPage.setVisible(true);
    }
  });

  return (
    <container
      ref={({ node }) => {
        container = node;
      }}
      style={{ flex: 1 }}
    />
  );
}

export { Router, Navigator };
