import { AttributedText, type View } from 'gui';
import { Show } from 'solid-js';
import {
  PREVIEW_LABEL_FONT,
  WINDOWS_APP_BACKGROUND_COLOR
} from '#/data/constants';
import { setCopyingEnabled } from '#/data/shared-state';
import type { Style } from '#/renderer/types';
import { open } from '#/utils/url-util';
import { LabelContextMenu } from '#/views/components/label-context-menu';
import { Space } from '#/views/components/space';
import { TextContextMenu } from '#/views/components/text-context-menu';

let timeout: NodeJS.Timeout | null = null;

function preventPwCopy() {
  if (timeout) {
    clearTimeout(timeout);
  }
  setCopyingEnabled(false);
  timeout = setTimeout(() => setCopyingEnabled(true), 100);
}

function PreviewLine(props: {
  children?: View[];
  label: string;
  value: string;
  style?: Style;
  last?: boolean;
  type?: 'text' | 'url';
}) {
  return (
    <container style={{ flexDirection: 'row', ...(props.style || {}) }}>
      <label
        attributedText={AttributedText.create(props.label, {
          font: PREVIEW_LABEL_FONT,
          align: 'end',
          valign: props.last ? 'start' : 'center'
        })}
        style={{ width: 80 }}
      />
      <Space height={1} width={10} />
      {props.children}
      <Show when={process.platform !== 'linux' && props.type !== 'url'}>
        <textedit
          style={{ flex: 1 }}
          text={props.value}
          {...(process.platform === 'win32'
            ? { backgroundColor: WINDOWS_APP_BACKGROUND_COLOR }
            : {})}
          onKeyDown={(_textedit, ev) => {
            switch (ev.key) {
              case 'Control':
                preventPwCopy();
                break;
              case 'Meta':
                preventPwCopy();
                break;
              case 'c':
                preventPwCopy();
                break;
              case 'C':
                preventPwCopy();
                break;
              default:
                setCopyingEnabled(true);
                break;
            }
          }}
          onMouseDown={(textEdit, ev) => {
            if (ev.button === 2 && textEdit.hasFocus()) {
              TextContextMenu({
                editable: false,
                textEdit
              }).popup();
            } else {
              textEdit.focus();
            }
          }}
          onTextChange={(textedit) => {
            textedit.setText(props.value);
          }}
        />
      </Show>
      <Show when={process.platform === 'linux' && props.type !== 'url'}>
        <label
          align="start"
          onMouseDown={(label, ev) => {
            if (ev.button === 2)
              LabelContextMenu({
                label
              }).popup();
          }}
          style={{ flex: 1 }}
          text={props.value}
          vAlign="start"
        />
      </Show>
      <Show when={props.type === 'url'}>
        <container style={{ flex: 1 }}>
          <container style={{ flex: 1, flexDirection: 'row' }}>
            <label
              align="start"
              color="#0000FF"
              cursor={props.value.trim() ? 'hand' : 'default'}
              onMouseDown={(label, ev) => {
                if (ev.button === 2)
                  LabelContextMenu({
                    label
                  }).popup();
                else if (props.value.trim()) open(props.value);
              }}
              style={{ flex: 1 }}
              text={props.value}
              vAlign="start"
            />
            <container style={{ flex: 1 }} />
          </container>
        </container>
      </Show>
    </container>
  );
}

export { PreviewLine };
