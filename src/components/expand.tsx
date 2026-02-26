import type { View } from 'gui';

function Expand(props: { direction?: 'row' | 'column' }): View[] {
  return (
    <container style={{ flex: 1, flexDirection: props.direction || 'row' }} />
  );
}

export { Expand };
