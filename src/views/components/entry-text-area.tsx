import type { Accessor } from 'solid-js';
import type { Style } from '#/renderer/types';
import { TextContextMenu } from './text-context-menu';

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
        align="end"
        style={{
          width: props.titleWidth || (process.platform === 'win32' ? 70 : 80)
        }}
        text={props.title}
        vAlign="start"
      />
      <textedit
        onKeyDown={(self, ev) => {
          if (ev.key === 'Backspace' && self.getText() === '') {
            return true;
          }
          return false;
        }}
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
        onTextChange={(textedit) => {
          if (props.onTextChange) {
            props.onTextChange(textedit.getText());
          }
        }}
        style={{ flex: 1, 'margin-left': 10 }}
        text={props.text ? props.text() : ''}
      />
    </container>
  );
}
export { EntryTextArea };
