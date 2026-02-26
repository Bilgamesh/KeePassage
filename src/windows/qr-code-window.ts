import { Container } from 'gui';
import { createWindow } from '@/data/window-manager';

function createQrCodeWindow(title: string) {
  const win = createWindow(title);
  const contentView = Container.create();
  contentView.setStyle({ flex: 1 });
  win.setContentView(contentView);
  win.center();
  return win;
}

export { createQrCodeWindow };
