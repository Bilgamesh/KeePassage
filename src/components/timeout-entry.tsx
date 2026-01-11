import { LARGE_ENTRY_STYLE } from '@/data/constants';
import { Style } from '@/renderer/types';
import { Entry } from 'gui';
import { createEffect, createSignal, on } from 'solid-js';

function TimeoutEntry(props: {
  title: string;
  checkboxWidth: number;
  entryWidth: number;
  style?: Style;
  value?: number;
  checked?: boolean;
  onValueChange?: (value: number) => void;
  onClick?: (value: boolean) => void;
}) {
  const ALLOWED_KEYS: string[] = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    'Backspace',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End'
  ] as const;
  const [seconds, setSeconds] = createSignal(props.value || 0);
  let entry: Entry;
  // const [checked, setChecked] = createSignal(props.checked ? props.checked() : false);

  createEffect(
    on(
      seconds,
      (value) => {
        if (props.onValueChange) {
          props.onValueChange(value);
        }
      },
      { defer: true }
    )
  );

  function increment() {
    const text = entry.getText();
    const number = Number(text.replace('sec', '').trim());
    setSeconds(number + 1);
    entry.setText(`${seconds()} sec`);
  }

  function decrement() {
    const text = entry.getText();
    const number = Number(text.replace('sec', '').trim());
    if (number > 0) {
      setSeconds(number - 1);
      entry.setText(`${seconds()} sec`);
    }
  }

  return (
    <container style={{ flexDirection: 'row', ...(props.style || {}) }}>
      <container style={{ width: props.checkboxWidth }}>
        <checkbox
          title={props.title}
          checked={props.checked || false}
          onClick={(checkbox) => {
            if (props.onClick) {
              props.onClick(checkbox.isChecked());
            }
          }}
        />
      </container>
      <entry
        enabled={props.checked || false}
        ref={({ node }) => {
          entry = node;
        }}
        text={`${props.value || 0} sec`}
        style={{ ...LARGE_ENTRY_STYLE, width: props.entryWidth }}
        onTextChange={(entry) => {
          const text = entry.getText();
          if (/^\d* sec$/g.test(text)) {
            const number = Number(text.replace('sec', '').trim());
            setSeconds(number);
          } else {
            entry.setText(`${seconds()} sec`);
          }
        }}
        onKeyDown={(entry, ev) => {
          if (ev.key === 'ArrowUp') {
            increment();
          }
          if (ev.key === 'ArrowDown') {
            decrement();
          }
          return !ALLOWED_KEYS.includes(ev.key);
        }}
      />
      <button
        enabled={props.checked || false}
        title="-"
        style={{ width: 20 }}
        onMouseDown={() => {
          decrement();
        }}
      />
      <button
        enabled={props.checked || false}
        title="+"
        style={{ width: 20 }}
        onMouseDown={() => {
          increment();
        }}
      />
    </container>
  );
}

export { TimeoutEntry };
