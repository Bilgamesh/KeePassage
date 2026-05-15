import { Container, type Window } from 'gui';
import { createWindow, deleteWindow } from '#/utils/ui';

function QrCodeWindow(props: { title: string }) {
  const win = createWindow(props.title) as Window & { fitSize: () => void };
  const contentView = Container.create();
  contentView.setStyle({ flex: 1 });
  win.setContentView(contentView);
  win.center();
  win.setContentSize(contentView.getPreferredSize());
  win.setResizable(false);
  win.setMaximizable(false);

  win.fitSize = () => win.setContentSize(contentView.getPreferredSize());

  win.onClose.connect(() => {
    deleteWindow(props.title);
  });

  return win;
}

export { QrCodeWindow };
