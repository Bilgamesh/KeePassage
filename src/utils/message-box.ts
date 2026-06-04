import { MessageBox, type Window } from 'gui';
import { SwError } from '#/data/errors';
import { t } from '#/data/i18n';

type WrappedError = { error: string };

function showError(
  window: Window,
  error: unknown,
  options?: { title?: string }
) {
  const msgBox = MessageBox.create();
  msgBox.setType('error');
  msgBox.setTitle('Error');

  if (error instanceof SwError)
    msgBox.setText(t(`yubikey_statuses.${error.info.label}`));
  else if (error instanceof Error && error.cause instanceof SwError)
    msgBox.setText(t(`yubikey_statuses.${error.cause.info.label}`));
  else if (error instanceof Error)
    msgBox.setText(`${error.message}\n${error.cause}`);
  else if (typeof error === 'string') msgBox.setText(error);
  else if (typeof (error as WrappedError)?.error === 'string')
    msgBox.setText((error as WrappedError).error);
  else msgBox.setText(t('yubikey_statuses.UNKNOWN'));

  if (options?.title) msgBox.setTitle(options.title);
  msgBox.runForWindow(window);
}

export { showError };
