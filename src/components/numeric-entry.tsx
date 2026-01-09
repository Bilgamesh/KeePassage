import { Style } from '@/renderer/types';
import { Entry } from 'gui';
import { createEffect, createSignal, on } from 'solid-js';

function NumericEntry(props: {
  style?: Style;
  entryStyle?: Style;
  value?: number;
  minValue?: number;
  maxValue?: number;
  onValueChange?: (value: number) => void;
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
    'Backspace',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End'
  ] as const;
  const [value, setValue] = createSignal(props.value || 1);
  let entry: Entry;

  createEffect(
    on(
      value,
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
    const number = Number(text);
    setValue(
      Math.max(Math.min(number + 1, props.maxValue || Infinity), props.minValue || -Infinity)
    );
    entry.setText(`${value()}`);
  }

  function decrement() {
    const text = entry.getText();
    const number = Number(text);
    if (number > 0) {
      setValue(
        Math.max(Math.min(number - 1, props.maxValue || Infinity), props.minValue || -Infinity)
      );
      entry.setText(`${value()}`);
    }
  }

  return (
    <container style={{ flexDirection: 'row', ...(props.style || {}) }}>
      <entry
        ref={({ node }) => {
          entry = node;
        }}
        text={`${props.value || 1}`}
        style={{ ...(props.entryStyle || {}) }}
        onTextChange={(entry) => {
          const text = entry.getText();
          if (text === '') {
            setValue(props.minValue || 0);
            return;
          }
          if (isNaN(Number(text))) {
            entry.setText(
              `${Math.max(Math.min(value(), props.maxValue || Infinity), props.minValue || -Infinity)}`
            );
          } else {
            setValue(
              Math.max(
                Math.min(Number(text), props.maxValue || Infinity),
                props.minValue || -Infinity
              )
            );
            entry.setText(`${value()}`);
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
        title="-"
        style={{ width: 20 }}
        onMouseDown={() => {
          decrement();
        }}
      />
      <button
        title="+"
        style={{ width: 20 }}
        onMouseDown={() => {
          increment();
        }}
      />
    </container>
  );
}

export { NumericEntry };
