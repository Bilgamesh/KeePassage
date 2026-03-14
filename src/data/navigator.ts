import { randomUUID, type UUID } from 'node:crypto';
import { createEffect, createSignal } from 'solid-js';

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

const history: historyItem[] = [
  {
    index: pageIndex(),
    id: randomUUID(),
    cleanup: null
  }
];

function push(pageSelector: pageSelector) {
  const input = pageSelector(PAGE_INDEXES);
  const { index, cleanup } =
    typeof input === 'number' ? { index: input } : input;
  history.push({ index, id: randomUUID(), cleanup: cleanup ?? null });
  setPageIndex(index);
}

function pushConditionally(options: { from: pageChecker; to: pageSelector }) {
  if (options.from(PAGE_INDEXES) === pageIndex()) push(options.to);
}

function replace(pageSelector: pageSelector) {
  const input = pageSelector(PAGE_INDEXES);
  const { index, cleanup } =
    typeof input === 'number' ? { index: input } : input;
  for (const item of history.reverse()) if (item.cleanup) item.cleanup();
  history.length = 0;
  history.push({ index, id: randomUUID(), cleanup: cleanup ?? null });
  setPageIndex(index);
}

function pop() {
  if (history.length < 2) return;
  const { cleanup } = history.pop()!;
  if (cleanup) cleanup();
  const { index } = history[history.length - 1]!;
  setPageIndex(index);
}

function addOnChange(callback: (page: PAGE_INDEXES) => void) {
  createEffect(() => {
    callback(pageIndex());
  });
}

function isCurrentPage(pageChecker: pageChecker) {
  const index = pageChecker(PAGE_INDEXES);
  if (typeof index === 'number') return pageIndex() === index;
  return index.includes(pageIndex());
}

export {
  push,
  pushConditionally,
  pop,
  replace,
  pageIndex,
  isCurrentPage,
  addOnChange,
  PAGE_INDEXES
};
