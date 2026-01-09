import { APP_BACKGROUND_COLOR } from '@/data/constants';
import { setCopyingEnabled } from '@/data/shared-state';
import { Style } from '@/renderer/types';
import { PreviewLabelFont } from '@/styles';
import { AttributedText, View } from 'gui';
import { Space } from './space';
import { TextContextMenu } from './text-context-menu';

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
}) {
  return (
    <container style={{ flexDirection: 'row', ...(props.style || {}) }}>
      <label
        style={{ width: 80 }}
        attributedText={AttributedText.create(props.label, {
          font: PreviewLabelFont,
          align: 'end',
          valign: props.last ? 'start' : 'center'
        })}
      />
      <Space height={1} width={10} />
      {props.children}
      <textedit
        style={{ flex: 1 }}
        text={props.value}
        {...(process.platform === 'win32' ? { backgroundColor: APP_BACKGROUND_COLOR } : {})}
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
        onKeyDown={(textedit, ev) => {
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
        onTextChange={(textedit) => {
          textedit.setText(props.value);
        }}
      />
    </container>
  );
}

export { PreviewLine };
