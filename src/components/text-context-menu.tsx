import { Clipboard, Menu, TextEdit } from 'gui';

import type { MenuItemOptions } from '@/renderer/types';

function TextContextMenu(props: { editable?: boolean; textEdit: TextEdit }) {
  if (props.editable) {
    return Menu.create([
      {
        role: 'copy',
        onClick: () => {
          props.textEdit.copy();
        }
      },
      {
        role: 'cut',
        onClick: () => {
          props.textEdit.cut();
        }
      },
      {
        role: 'paste',
        enabled: !!Clipboard.get().getText(),
        onClick: () => {
          props.textEdit.paste();
        }
      },
      {
        role: 'select-all',
        onClick: () => {
          props.textEdit.selectAll();
        }
      }
    ] as MenuItemOptions[]);
  } else {
    return Menu.create([
      {
        role: 'copy',
        onClick: () => {
          props.textEdit.copy();
        }
      },
      {
        role: 'select-all',
        onClick: () => {
          props.textEdit.selectAll();
        }
      }
    ] as MenuItemOptions[]);
  }
}

export { TextContextMenu };
