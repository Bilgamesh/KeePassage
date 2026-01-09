import { Expand } from '@/components/expand';
import { Image } from '@/components/image';
import { PAGE_INDEXES } from '@/data/constants';
import { mainPageIndex, setMainPageIndex } from '@/data/shared-state';
import { TitleFont } from '@/styles';
import { sleep } from '@/utils/time-util';
import { AttributedText } from 'gui';

let controller: AbortController;

function requestTouch() {
  controller = new AbortController();
  const previousPageIndex = mainPageIndex();
  // In case of incorrect PIN, PSCS usually returns an error in less than 10ms,
  // but if the PIN is correct, PCSC stays silent until user touches the key sensor.
  // We assume that if there was no error within the initial 50ms, PIN must be correct and we prompt the user to tap the key.
  sleep(50).then(() => {
    const stillOnSamePage = previousPageIndex === mainPageIndex();
    if (!controller.signal.aborted && stillOnSamePage) {
      setMainPageIndex(PAGE_INDEXES.TOUCH);
    }
  });
  return controller.signal;
}

function TouchPage() {
  return (
    <container style={{ flex: 1 }}>
      <Expand />
      <container style={{ flexDirection: 'row' }}>
        <Expand direction="row" />
        <group title="User presence" style={{ width: 400, height: 400 }}>
          <container style={{ flex: 1 }}>
            <Expand />
            <container style={{ flexDirection: 'column' }}>
              <label
                attributedText={AttributedText.create(
                  'Tap your YubiKey sensor\nto complete the operation',
                  {
                    align: 'center',
                    font: TitleFont
                  }
                )}
                style={{ 'margin-bottom': 50 }}
              />
              <Image src={['img', 'touch.png']} size={{ height: 100, width: 100 }} scale={5} />
              <button
                title="Cancel"
                style={{
                  height: 30,
                  width: 300,
                  'margin-left': 45,
                  'margin-top': 100
                }}
                onClick={() => {
                  controller.abort('Cancel');
                }}
              />
            </container>
            <Expand />
          </container>
        </group>
        <Expand direction="row" />
      </container>
      <Expand />
    </container>
  );
}
export { requestTouch, TouchPage };
