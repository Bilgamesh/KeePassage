import type { Entry } from 'gui';
import { createEffect, createSignal, on } from 'solid-js';
import type { Style } from '#/renderer/types';

function NumericEntry(props: {
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
    '0',
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
      Math.max(
        Math.min(number + 1, props.maxValue || Infinity),
        props.minValue || -Infinity
      )
    );
    entry.setText(`${value()}`);
  }

  function decrement() {
    const text = entry.getText();
    const number = Number(text);
    if (number > 0) {
      setValue(
        Math.max(
          Math.min(number - 1, props.maxValue || Infinity),
          props.minValue || -Infinity
        )
      );
      entry.setText(`${value()}`);
    }
  }

  return (
    <>
      <entry
        onKeyDown={(_entry, ev) => {
          if (ev.key === 'ArrowUp') {
            increment();
          }
          if (ev.key === 'ArrowDown') {
            decrement();
          }
          return !ALLOWED_KEYS.includes(ev.key);
        }}
        onTextChange={(entry) => {
          const text = entry.getText();
          if (text === '') {
            setValue(props.minValue || 0);
            entry.setText('');
            return;
          }
          if (Number.isNaN(Number(text))) {
            entry.setText(
              `${Math.max(Math.min(value(), props.maxValue || Infinity), props.minValue || -Infinity)}`
            );
          } else {
            const newValue = Math.max(
              Math.min(Number(text), props.maxValue || Infinity),
              props.minValue || -Infinity
            );
            setValue(newValue);
            if (entry.getText() !== `${newValue}`) {
              entry.setText(`${value()}`);
            }
          }
        }}
        ref={({ node }) => {
          entry = node;
        }}
        style={{ ...(props.entryStyle || {}) }}
        text={`${props.value ?? props.minValue ?? 1}`}
      />
      <button
        onMouseDown={() => {
          decrement();
        }}
        style={{ width: 20 }}
        title="-"
      />
      <button
        onMouseDown={() => {
          increment();
        }}
        style={{ width: 20 }}
        title="+"
      />
    </>
  );
}

export { NumericEntry };
