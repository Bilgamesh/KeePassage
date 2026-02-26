import { Image } from 'gui';
import logo from '@/assets/img/logo.ico';

function AppIcon() {
  return Image.createFromPath(logo).resize(
    {
      height: 40,
      width: 40,
    },
    1,
  );
}

export { AppIcon };
