import { Style } from '@/renderer/types';
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
export const SmallButton: Style = {
  height: 30,
  width: 80
};
export const LargeButton: Style = {
  height: 30,
  width: 140
};
export const EntryButton: Style = {
  height: 25,
  width: 25
};
export const SmallEntry: Style = {
  height: 20
};
export const LargeEntry: Style = {
  height: 25
};
