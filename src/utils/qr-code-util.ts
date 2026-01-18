import { Container } from 'gui';
import { toString } from 'qrcode';

import { QRCode } from '@/components/qrcode';
import { render } from '@/renderer';
import { createQrCodeWindow } from '@/windows/qr-code-window';

async function showQrCodeWindow(title: string, text: string) {
  const code = await toString(text);
  const win = createQrCodeWindow(title);
  render(() => QRCode({ code, window: win }), win);
  const view = win.getContentView() as Container;
  win.setContentSize(view.getPreferredSize());
  win.setResizable(false);
  win.setMaximizable(false);
  win.activate();
}

export { showQrCodeWindow };
