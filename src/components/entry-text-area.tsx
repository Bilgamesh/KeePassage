import { Accessor } from 'solid-js';
import { TextContextMenu } from './text-context-menu';

import { Style } from '@/renderer/types';

function EntryTextArea(props: {
  title: string;
  style?: Style;
  titleWidth?: number;
  text?: Accessor<string>;
  onTextChange?: (text: string) => void;
}) {
  return (
    <container style={props.style || {}}>
      <label
        text={props.title}
        style={{ width: props.titleWidth || (process.platform === 'win32' ? 70 : 80) }}
        align="end"
        vAlign="start"
      />
      <textedit
        text={props.text ? props.text() : ''}
        style={{ flex: 1, 'margin-left': 10 }}
        onMouseDown={(textEdit, ev) => {
          if (ev.button === 2 && textEdit.hasFocus()) {
            TextContextMenu({
              editable: true,
              textEdit
            }).popup();
          } else {
            textEdit.focus();
          }
        }}
        onKeyDown={(self, ev) => {
          if (ev.key === 'Backspace' && self.getText() === '') {
            return true;
          }
          return false;
        }}
        onTextChange={(self) => {
          if (props.onTextChange) {
            props.onTextChange(self.getText());
          }
        }}
      />
    </container>
  );
}
export { EntryTextArea };
