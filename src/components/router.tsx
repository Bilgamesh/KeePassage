import type { Container, View } from 'gui';
import { type Accessor, children, createEffect } from 'solid-js';
import type { View as ViewWrapper } from '@/renderer/elements/view';

function Router(props: {
  children: View[];
  selectedPageIndex: Accessor<number>;
}): View[] {
  const pages: ViewWrapper[] = children(() => props.children).toArray();
  let container: Container;

  createEffect(() => {
    const previousPage =
      container.childCount() > 0 ? container.childAt(0) : null;
    const nextPage = pages[props.selectedPageIndex()]?.node || null;
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

export { Router };
