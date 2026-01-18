import { View } from 'gui';
import { Accessor } from 'solid-js';

import { ReactiveEntry, ReactivePassword } from '@/components/reactive-textfields';
import { SMALL_ENTRY_STYLE } from '@/data/constants';

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
      <ReactiveEntry
        visible={props.type === 'normal'}
        text={props.text || (() => '')}
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
        onTextChange={(text) => {
          if (props.onTextChange) {
            props.onTextChange(text);
          }
        }}
      />
      <ReactivePassword
        visible={props.type === 'password'}
        text={props.text || (() => '')}
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
        onTextChange={(text) => {
          if (props.onTextChange) {
            props.onTextChange(text);
          }
        }}
      />
      {props.children}
    </container>
  );
}
export { EntryLine };
