import { getResourcePath } from '@/utils/folder-util';
import { Font, Image } from 'gui';

export const PasswordFont = Font.create('Consolas', 18, 'normal', 'normal');
export const TitleFont = Font.create('Arial', 18, 'bold', 'normal');
export const PreviewLabelFont = Font.create('Arial', 12, 'bold', 'normal');
export const AppIcon = Image.createFromPath(getResourcePath('img', 'logo.ico')).resize(
  {
    height: 40,
    width: 40
  },
  1
);
