import type { Entry, KeyEvent, View } from 'gui';
import { type Accessor, Show } from 'solid-js';
import { SMALL_ENTRY_STYLE } from '#/data/constants';

function EntryLine(props: {
  title: Accessor<string>;
  titleWidth?: number;
  text?: Accessor<string>;
  type?: 'password' | 'normal';
  onTextChange?: (text: string) => void;
  children?: View[];
  editableTitle?: boolean;
  onTitleChange?: (text: string) => void;
  onTitleSubmit?: () => void;
  onTitleClick?: () => void;
}) {
  if (!props.type) props.type = 'normal';

  const silenceKeyDown = (entry: Entry, ev: KeyEvent) => {
    if (ev.key === 'Enter') return true;
    if (ev.key === 'Backspace' && entry.getText() === '') return true;
    return false;
  };

  return (
    <container style={{ flexDirection: 'row', 'margin-top': 10 }}>
      <Show when={props.editableTitle}>
        <entry
          onKeyDown={(self, ev) => {
            if (ev.key === 'Enter' && props.onTitleSubmit)
              props.onTitleSubmit();
            return silenceKeyDown(self, ev);
          }}
          onTextChange={(entry) => {
            if (props.onTitleChange) props.onTitleChange(entry.getText());
          }}
          style={{
            width: props.titleWidth || (process.platform === 'linux' ? 90 : 70)
          }}
          text={props.title()}
        />
      </Show>
      <Show when={!props.editableTitle}>
        <label
          align="end"
          cursor={props.onTitleClick ? 'hand' : 'default'}
          onMouseUp={() => {
            if (props.onTitleClick) props.onTitleClick();
          }}
          style={{
            width: props.titleWidth || (process.platform === 'linux' ? 90 : 70)
          }}
          text={
            props.title().endsWith(':') ? props.title() : `${props.title()}:`
          }
        />
      </Show>
      <entry
        onKeyDown={silenceKeyDown}
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
        onKeyDown={silenceKeyDown}
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
