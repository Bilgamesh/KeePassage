import { Clipboard, Menu, type TextEdit } from 'gui';
import { t } from '@/data/i18n';
import type { MenuItemOptions } from '@/renderer/types';

function TextContextMenu(props: { editable?: boolean; textEdit: TextEdit }) {
  if (props.editable) {
    return Menu.create([
      {
        label: t('copy'),
        role: 'copy',
        onClick: () => {
          props.textEdit.copy();
        },
      },
      {
        label: t('cut'),
        role: 'cut',
        onClick: () => {
          props.textEdit.cut();
        },
      },
      {
        label: t('paste'),
        role: 'paste',
        enabled: !!Clipboard.get().getText(),
        onClick: () => {
          props.textEdit.paste();
        },
      },
      {
        label: t('select_all'),
        role: 'select-all',
        onClick: () => {
          props.textEdit.selectAll();
        },
      },
    ] as MenuItemOptions[]);
  } else {
    return Menu.create([
      {
        label: t('copy'),
        role: 'copy',
        onClick: () => {
          props.textEdit.copy();
        },
      },
      {
        label: t('select_all'),
        role: 'select-all',
        onClick: () => {
          props.textEdit.selectAll();
        },
      },
    ] as MenuItemOptions[]);
  }
}

export { TextContextMenu };
