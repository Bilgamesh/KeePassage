import { Clipboard, type Label, Menu } from 'gui';
import { getTranslator } from '#/data/i18n';
import type { AppState } from '#/data/shared-state';
import type { MenuItemOptions } from '#/renderer/types';

function LabelContextMenu(props: { label: Label; state: AppState }) {
  const t = getTranslator(props.state);
  return Menu.create([
    {
      label: t('copy'),
      onClick: () => {
        Clipboard.get().setText(props.label.getText());
      }
    }
  ] as MenuItemOptions[]);
}

export { LabelContextMenu };
