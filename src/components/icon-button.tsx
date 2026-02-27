import { type Button, Image } from 'gui';
import { DARK_MODE_FONT_COLOR, DISABLED_COLOR } from '#/data/constants';
import { isDark } from '#/data/shared-state';
import type { Style } from '#/renderer/types';

function IconButton(props: {
  src: string;
  tooltip?: string;
  enabled?: boolean;
  size?: { width: number; height: number };
  imageSize?: { width: number; height: number };
  style?: Style;
  onClick?: (self: Button) => void;
  visible?: boolean;
}) {
  if (props.enabled === undefined) {
    props.enabled = true;
  }

  const image = () => {
    const image = Image.createFromPath(props.src).resize(
      {
        height: props.imageSize?.height || 20,
        width: props.imageSize?.width || 20
      },
      4
    );
    if (!props.enabled) {
      return image.tint(DISABLED_COLOR);
    }
    if (process.platform === 'win32') {
      return image;
    }
    if (isDark()) {
      return image.tint(DARK_MODE_FONT_COLOR);
    }
    return image;
  };

  return (
    <button
      enabled={props.enabled}
      image={image()}
      onClick={props.onClick || (() => {})}
      style={{
        height: props.size?.height || 40,
        width: props.size?.width || 40,
        'margin-left': 10,
        'margin-top': 5,
        ...(props.style || {})
      }}
      tooltip={props.tooltip || ''}
      visible={props.visible !== false}
    />
  );
}

export { IconButton };
