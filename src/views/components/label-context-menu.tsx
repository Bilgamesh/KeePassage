import { Clipboard, type Label, Menu } from 'gui';
import { t } from '#/data/i18n';
import type { MenuItemOptions } from '#/renderer/types';

function LabelContextMenu(props: { label: Label }) {
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
