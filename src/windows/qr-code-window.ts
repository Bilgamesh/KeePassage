import { createWindow } from '@/data/window-manager';
import { Container } from 'gui';

function createQrCodeWindow(title: string) {
  const win = createWindow(title);
  const contentView = Container.create();
  contentView.setStyle({ flex: 1 });
  win.setContentView(contentView);
  win.center();
  return win;
}

export { createQrCodeWindow };
