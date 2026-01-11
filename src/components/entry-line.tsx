import { SMALL_ENTRY_STYLE } from '@/data/constants';
import { View } from 'gui';
import { Accessor } from 'solid-js';

function EntryLine(props: {
  title: string;
  titleWidth?: number;
  text?: Accessor<string>;
  type?: 'password' | 'normal';
  onTextChange?: (text: string) => void;
  children?: View[];
}) {
  if (!props.type) {
    props.type = 'normal';
  }
  return (
    <container style={{ flexDirection: 'row', 'margin-top': 10 }}>
      <label
        text={props.title}
        style={{ width: props.titleWidth || (process.platform === 'win32' ? 70 : 80) }}
        align="end"
      />
      <entry
        visible={props.type === 'normal'}
        text={props.text ? props.text() : ''}
        style={{ flex: 1, 'margin-left': 10, 'margin-right': 0, ...SMALL_ENTRY_STYLE }}
        onKeyDown={(self, ev) => {
          if (ev.key === 'Enter') {
            return true;
          }
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
      <password
        visible={props.type === 'password'}
        text={props.text ? props.text() : ''}
        style={{ flex: 1, 'margin-left': 10, 'margin-right': 0, ...SMALL_ENTRY_STYLE }}
        onKeyDown={(self, ev) => {
          if (ev.key === 'Enter') {
            return true;
          }
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
      {props.children}
    </container>
  );
}
export { EntryLine };
