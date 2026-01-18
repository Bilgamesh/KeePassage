import type { Entry, TextEdit } from 'gui';
import { Accessor, createEffect, createSignal } from 'solid-js';

import { entry, textedit } from '@/renderer/types';

function ReactiveEntry(
  props: Omit<entry<Entry>, 'text' | 'onTextChange'> & {
    text: Accessor<string>;
    onTextChange: (text: string) => void;
  }
) {
  const [value, setValue] = createSignal(props.text ? props.text() : '');
  let updateBlocked = false;
  createEffect(() => {
    const text = props.text();
    if (!updateBlocked) {
      setValue(text);
    }
  });
  return (
    <entry
      {...props}
      text={value()}
      onTextChange={(entry) => {
        updateBlocked = true;
        props.onTextChange(entry.getText());
        updateBlocked = false;
      }}
    />
  );
}

function ReactivePassword(
  props: Omit<entry<Entry>, 'text' | 'onTextChange'> & {
    text: Accessor<string>;
    onTextChange: (text: string) => void;
  }
) {
  const [value, setValue] = createSignal(props.text ? props.text() : '');
  let updateBlocked = false;
  createEffect(() => {
    const text = props.text();
    if (!updateBlocked) {
      setValue(text);
    }
  });
  return (
    <password
      {...props}
      text={value()}
      onTextChange={(entry) => {
        updateBlocked = true;
        props.onTextChange(entry.getText());
        updateBlocked = false;
      }}
    />
  );
}

function ReactiveTextArea(
  props: Omit<textedit<TextEdit>, 'text' | 'onTextChange'> & {
    text: Accessor<string>;
    onTextChange: (text: string) => void;
  }
) {
  const [value, setValue] = createSignal(props.text ? props.text() : '');
  let updateBlocked = false;
  createEffect(() => {
    const text = props.text();
    if (!updateBlocked) {
      setValue(text);
    }
  });
  return (
    <textedit
      {...props}
      text={value()}
      onTextChange={(entry) => {
        updateBlocked = true;
        props.onTextChange(entry.getText());
        updateBlocked = false;
      }}
    />
  );
}

export { ReactiveEntry, ReactivePassword, ReactiveTextArea };
