import { getResourcePath } from '@/utils/folder-util';
import { Image } from 'gui';

function AppIcon() {
  return Image.createFromPath(getResourcePath('img', 'logo.ico')).resize(
    {
      height: 40,
      width: 40
    },
    1
  );
}

export { AppIcon };
