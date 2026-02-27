import type { View } from 'gui';
import type { Accessor } from 'solid-js';
import { SMALL_ENTRY_STYLE } from '#/data/constants';

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
        align="end"
        style={{
          width: props.titleWidth || (process.platform === 'win32' ? 70 : 80)
        }}
        text={props.title}
      />
      <entry
        onKeyDown={(self, ev) => {
          if (ev.key === 'Enter') {
            return true;
          }
          if (ev.key === 'Backspace' && self.getText() === '') {
            return true;
          }
          return false;
        }}
        onTextChange={(entry) => {
          if (props.onTextChange) {
            props.onTextChange(entry.getText());
          }
        }}
        style={{
          flex: 1,
          'margin-left': 10,
          'margin-right': 0,
          ...SMALL_ENTRY_STYLE
        }}
        text={props.text ? props.text() : ''}
        visible={props.type === 'normal'}
      />
      <password
        onKeyDown={(self, ev) => {
          if (ev.key === 'Enter') {
            return true;
          }
          if (ev.key === 'Backspace' && self.getText() === '') {
            return true;
          }
          return false;
        }}
        onTextChange={(entry) => {
          if (props.onTextChange) {
            props.onTextChange(entry.getText());
          }
        }}
        style={{
          flex: 1,
          'margin-left': 10,
          'margin-right': 0,
          ...SMALL_ENTRY_STYLE
        }}
        text={props.text ? props.text() : ''}
        visible={props.type === 'password'}
      />
      {props.children}
    </container>
  );
}
export { EntryLine };
