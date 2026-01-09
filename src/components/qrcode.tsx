import { PasswordFont } from '@/styles';
import { AttributedText, Window } from 'gui';

function QRCode(props: { code: string; window: Window }) {
  return (
    <container>
      <label
        attributedText={AttributedText.create(props.code, {
          font: PasswordFont,
          align: 'center',
          wrap: false
        })}
      />
    </container>
  );
}

export { QRCode };
