import { MessageBox, Window } from 'gui';

function showError(window: Window, error: unknown, options?: { title?: string }) {
  const msgBox = MessageBox.create();
  msgBox.setType('error');
  msgBox.setTitle('Error');
  if (error instanceof Error) {
    msgBox.setText(`${error.message}\n${error.cause}`);
  } else if (typeof error === 'string') {
    msgBox.setText(error);
  } else if (typeof (error as any)?.error === 'string') {
    msgBox.setText((error as any).error);
  } else {
    msgBox.setText('Unknown error');
  }
  if (options?.title) {
    msgBox.setTitle(options.title);
  }
  msgBox.runForWindow(window);
}

export { showError };
