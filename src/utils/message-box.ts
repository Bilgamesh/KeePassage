import { MessageBox, type Window } from 'gui';
import { SwError } from '#/data/errors';
import { getTranslator } from '#/data/i18n';
import type { AppState } from '#/data/shared-state';

type WrappedError = { error: string };

function showError(
  window: Window,
  error: unknown,
  state: AppState,
  options?: { title?: string }
) {
  const t = getTranslator(state);
  const msgBox = MessageBox.create();
  msgBox.setType('error');
  msgBox.setTitle(t('error'));

  if (error instanceof SwError)
    msgBox.setText(t(`yubikey_status_words.${error.statusWord}`));
  else if (error instanceof Error && error.cause instanceof SwError)
    msgBox.setText(t(`yubikey_status_words.${error.cause.statusWord}`));
  else if (error instanceof Error)
    msgBox.setText(`${error.message}\n${error.cause}`);
  else if (typeof error === 'string') msgBox.setText(error);
  else if (typeof (error as WrappedError)?.error === 'string')
    msgBox.setText((error as WrappedError).error);
  else msgBox.setText(t('yubikey_status_words.UNKNOWN'));

  if (options?.title) msgBox.setTitle(options.title);
  msgBox.runForWindow(window);
}

export { showError };
