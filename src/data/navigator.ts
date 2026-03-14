import { randomUUID, type UUID } from 'node:crypto';
import { createEffect, createSignal, on } from 'solid-js';

const PAGE_INDEXES = {
  WELCOME: 0,
  PINTENTRY: 1,
  TOUCH: 2,
  DB_INDEX: 3,
  ENTRY: 4,
  SETTINGS: 5,
  GENERATOR: 6
} as const;

type PAGE_INDEXES = (typeof PAGE_INDEXES)[keyof typeof PAGE_INDEXES];

type historyItem = {
  index: PAGE_INDEXES;
  id: UUID;
  cleanup?: (() => void) | null;
};

type pageSelector = (
  pages: typeof PAGE_INDEXES
) => PAGE_INDEXES | { index: PAGE_INDEXES; cleanup?: () => void };

type pageChecker = (
  pages: typeof PAGE_INDEXES
) => PAGE_INDEXES | PAGE_INDEXES[];

const [pageIndex, setPageIndex] = createSignal(
  PAGE_INDEXES.WELCOME as PAGE_INDEXES
);

const [history, setHistory] = createSignal<historyItem[]>([
  {
    index: pageIndex(),
    id: randomUUID(),
    cleanup: null
  }
]);

function push(pageSelector: pageSelector) {
  const input = pageSelector(PAGE_INDEXES);
  const { index, cleanup } =
    typeof input === 'number' ? { index: input } : input;
  setHistory((history) => [
    ...history,
    { index, id: randomUUID(), cleanup: cleanup ?? null }
  ]);
  setPageIndex(index);
}

function replace(options: { from?: pageChecker; to: pageSelector }) {
  const input = options.to(PAGE_INDEXES);
  const from = options.from ? options.from(PAGE_INDEXES) : null;

  if (Array.isArray(from) && from.includes(pageIndex())) {
    return replace({ to: options.to });
  }
  if (from === pageIndex()) {
    return replace({ to: options.to });
  }

  const { index, cleanup } =
    typeof input === 'number' ? { index: input } : input;

  for (const item of history().reverse()) {
    if (item.cleanup) item.cleanup();
  }
  setHistory([{ index, id: randomUUID(), cleanup: cleanup ?? null }]);
  setPageIndex(index);
}

function pop() {
  if (history().length < 2) return;
  const lastItem = history()[history().length - 1]!;
  if (lastItem.cleanup) lastItem.cleanup();
  setHistory((history) => [...history.slice(0, -1)]);
  const { index } = history()[history().length - 1]!;
  setPageIndex(index);
}

function subscribe(callback: (page: PAGE_INDEXES) => void) {
  createEffect(on(pageIndex, (value) => callback(value)));
}

function isCurrentPage(pageChecker: pageChecker) {
  const index = pageChecker(PAGE_INDEXES);
  if (typeof index === 'number') return pageIndex() === index;
  return index.includes(pageIndex());
}

export {
  push,
  pop,
  replace,
  pageIndex,
  isCurrentPage,
  subscribe,
  PAGE_INDEXES
};
