/*
 Improves reactivity of text fields by avoiding re-renders when user is editing the field, even if signal value is updated.
*/

import type { Entry, TextEdit } from 'gui';
import { Accessor, createEffect } from 'solid-js';

import { entry, textedit } from '@/renderer/types';

function ReactiveEntry(
  props: Omit<entry<Entry>, 'text' | 'onTextChange'> & {
    text: Accessor<string>;
    onTextChange: (text: string) => void;
  }
) {
  const initialValue = props.text ? props.text() : '';
  let entry: Entry;
  let updateBlocked = false;
  createEffect(() => {
    const text = props.text();
    if (!updateBlocked) {
      entry.setText(text);
    }
  });
  return (
    <entry
      {...props}
      ref={({ node }) => {
        entry = node;
      }}
      text={initialValue}
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
  const initialValue = props.text ? props.text() : '';
  let entry: Entry;
  let updateBlocked = false;
  createEffect(() => {
    const text = props.text();
    if (!updateBlocked) {
      entry.setText(text);
    }
  });
  return (
    <password
      {...props}
      ref={({ node }) => {
        entry = node;
      }}
      text={initialValue}
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
  let textEdit: TextEdit;
  const initialValue = props.text ? props.text() : '';
  let updateBlocked = false;
  createEffect(() => {
    const text = props.text();
    if (!updateBlocked) {
      textEdit.setText(text);
    }
  });
  return (
    <textedit
      {...props}
      ref={({ node }) => {
        textEdit = node;
      }}
      text={initialValue}
      onTextChange={(entry) => {
        updateBlocked = true;
        props.onTextChange(entry.getText());
        updateBlocked = false;
      }}
    />
  );
}

export { ReactiveEntry, ReactivePassword, ReactiveTextArea };
