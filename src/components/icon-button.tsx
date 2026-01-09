import { Style } from '@/renderer/types';
import { getResourcePath } from '@/utils/folder-util';
import { Button, Image } from 'gui';

function IconButton(props: {
  icon: string;
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
  return (
    <button
      visible={props.visible !== false}
      enabled={props.enabled}
      style={{
        height: props.size?.height || 40,
        width: props.size?.width || 40,
        'margin-left': 10,
        'margin-top': 5,
        ...(props.style || {})
      }}
      image={Image.createFromPath(getResourcePath('icons', props.icon)).resize(
        { height: props.imageSize?.height || 20, width: props.imageSize?.width || 20 },
        4
      )}
      tooltip={props.tooltip || ''}
      onClick={props.onClick || (() => {})}
    />
  );
}

export { IconButton };
