import { Image as GuiImage } from 'gui';
import type { Style } from '@/renderer/types';

function Image(props: {
  src: string | null;
  size: { height: number; width: number };
  scale?: number;
  style?: Style;
  tint?: string;
}) {
  const image = () => {
    const image = props.src
      ? GuiImage.createFromPath(props.src).resize(props.size, props.scale || 1)
      : GuiImage.createEmpty().resize(props.size, props.scale || 1);
    if (props.tint) {
      return image.tint(props.tint);
    }
    return image;
  };
  return <gifplayer image={image()} style={props.style || {}} />;
}

export { Image };
