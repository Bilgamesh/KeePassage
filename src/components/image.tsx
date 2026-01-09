import { Style } from '@/renderer/types';
import { getResourcePath } from '@/utils/folder-util';
import { Image as GuiImage } from 'gui';

function Image(props: {
  src: string[] | null;
  size: { height: number; width: number };
  scale?: number;
  style?: Style;
}) {
  return (
    <gifplayer
      image={
        props.src
          ? GuiImage.createFromPath(getResourcePath(...props.src)).resize(
              props.size,
              props.scale || 1
            )
          : GuiImage.createEmpty().resize(props.size, props.scale || 1)
      }
      style={props.style || {}}
    />
  );
}

export { Image };
