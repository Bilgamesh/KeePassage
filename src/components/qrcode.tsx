import { PASSWORD_FONT } from '@/data/constants';
import { AttributedText, Window } from 'gui';

function QRCode(props: { code: string; window: Window }) {
  return (
    <container>
      <label
        attributedText={AttributedText.create(props.code, {
          font: PASSWORD_FONT,
          align: 'center',
          wrap: false
        })}
      />
    </container>
  );
}

export { QRCode };
