import { randomUUID, type UUID } from 'node:crypto';
import type { Container, View } from 'gui';
import {
  type Accessor,
  children,
  createEffect,
  createSignal,
  on,
  onCleanup,
  type Setter
} from 'solid-js';
import type { View as ViewWrapper } from '#/renderer/elements/view';

type Cleanup = (() => void) | null;
type ReplacementItem<T extends IndexRecord> = {
  index: Key<T>;
  cleanup?: Cleanup;
};
type HistoryItem<T extends IndexRecord> = {
  index: T[keyof T];
  id: UUID;
  cleanup?: Cleanup;
};
type IndexRecord = Record<string, number>;
type Key<T extends IndexRecord> = keyof T;

class Navigator<T extends IndexRecord> {
  public id: string;
  private history: Accessor<HistoryItem<T>[]>;
  private setHistory: Setter<HistoryItem<T>[]>;
  public pageIndex: Accessor<T[keyof T]>;
  private setPageIndex: Setter<T[keyof T]>;
  private indexes: T;

  constructor(indexes: T) {
    const [pageIndex, setPageIndex] = createSignal(0 as T[keyof T]);
    const [history, setHistory] = createSignal<HistoryItem<T>[]>([
      {
        index: pageIndex(),
        id: randomUUID(),
        cleanup: null
      }
    ]);
    this.id = randomUUID();
    this.history = history;
    this.setHistory = setHistory;
    this.pageIndex = pageIndex;
    this.setPageIndex = setPageIndex;
    this.indexes = indexes;
  }

  push(key: Key<T> | ReplacementItem<T>) {
    const input =
      typeof key === 'string'
        ? { index: this.indexes[key]! as T[keyof T] }
        : {
            index: this.indexes[(key as ReplacementItem<T>).index],
            cleanup: (key as ReplacementItem<T>).cleanup
          };
    const { index, cleanup } =
      typeof input === 'number' ? { index: input } : input;
    this.setHistory((history) => [
      ...history,
      { index, id: randomUUID(), cleanup: cleanup ?? null }
    ]);
    this.setPageIndex(index as Exclude<T[keyof T], Function>);
  }

  replace(options: {
    from?: Key<T> | Key<T>[];
    to: Key<T> | ReplacementItem<T>;
  }): void {
    const input =
      typeof options.to === 'string'
        ? { index: this.indexes[options.to]! as T[keyof T] }
        : {
            index: this.indexes[(options.to as ReplacementItem<T>).index],
            cleanup: (options.to as ReplacementItem<T>).cleanup
          };
    const from = options.from
      ? Array.isArray(options.from)
        ? options.from.map((k) => this.indexes[k])
        : this.indexes[options.from]
      : null;

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
      typeof input === 'number' ? { index: input } : input;

    for (const item of this.history().reverse())
      if (item.cleanup) item.cleanup();

    this.setHistory([{ index, id: randomUUID(), cleanup: cleanup ?? null }]);
    this.setPageIndex(index as Exclude<T[keyof T], Function>);
  }

  pop() {
    if (this.history().length < 2) return;
    const lastItem = this.history()[this.history().length - 1]!;
    if (lastItem.cleanup) lastItem.cleanup();
    this.setHistory((history) => [...history.slice(0, -1)]);
    const { index } = this.history()[this.history().length - 1]!;
    this.setPageIndex(index as Exclude<T[keyof T], Function>);
  }

  subscribe(callback: (page: number) => void) {
    createEffect(on(this.pageIndex, (value) => callback(value)));
  }

  isCurrentPage(key: Key<T> | Key<T>[] | T[keyof T]) {
    const index = Array.isArray(key)
      ? key.map((k) => this.indexes[k])
      : typeof key === 'number'
        ? key
        : this.indexes[key];
    if (Array.isArray(index)) return index.includes(this.pageIndex());
    else return this.pageIndex() === index;
  }
}

function Router<T extends IndexRecord>(props: {
  children: View[];
  navigator: Navigator<T>;
}): View[] {
  const pages: ViewWrapper[] = children(() => props.children).toArray();
  let container: Container | null;

  createEffect(() => {
    const previousPage =
      container!.childCount() > 0 ? container!.childAt(0) : null;
    const nextPage = pages[props.navigator.pageIndex()]?.node || null;
    if (previousPage) {
      previousPage.setVisible(false);
      container!.removeChildView(previousPage);
    }
    if (nextPage) {
      container!.addChildView(nextPage);
      nextPage.setVisible(true);
    }
  });

  onCleanup(() => {
    // Allow window to finish closing animation before removing widgets
    setTimeout(() => {
      for (const page of pages) page.cleanup();
    }, 2000);
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

export { Navigator, Router };
