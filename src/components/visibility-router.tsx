import type { View } from 'gui';
import { children, For } from 'solid-js';

function VisibilityRouter(props: {
  children: View[];
  selectedPageIndex: number;
}): View[] {
  const pages = children(() => props.children).toArray();
  return (
    <container style={{ flex: 1 }}>
      <label
        text="Page not found"
        visible={
          props.selectedPageIndex < 0 || props.selectedPageIndex >= pages.length
        }
      />
      <For each={pages}>
        {(page: View[], index) => (
          <container
            style={{ flex: index() === props.selectedPageIndex ? 1 : 0 }}
            visible={index() === props.selectedPageIndex}
          >
            {page}
          </container>
        )}
      </For>
    </container>
  );
}

export { VisibilityRouter };
