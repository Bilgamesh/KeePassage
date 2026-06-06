import { AttributedText, type Label, type Window } from 'gui';
import { onCleanup } from 'solid-js';
import { PASSWORD_FONT } from '#/data/constants';

function QRCode(props: { code: string; window: Window }) {
  let label: Label;

  onCleanup(() => {
    props.code = '';
    label.setAttributedText(AttributedText.create('', {}));
  });

  return (
    <container>
      <label
        attributedText={AttributedText.create(props.code, {
          font: PASSWORD_FONT,
          align: 'center',
          wrap: false
        })}
        ref={({ node }) => {
          label = node;
        }}
      />
    </container>
  );
}

export { QRCode };
