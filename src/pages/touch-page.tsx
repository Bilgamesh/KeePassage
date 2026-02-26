import { setTimeout } from 'node:timers/promises';
import { AttributedText } from 'gui';
import touchImage from '#/assets/img/touch.png';
import { Expand } from '#/components/expand';
import { Image } from '#/components/image';
import {
  DARK_MODE_FONT_COLOR,
  PAGE_INDEXES,
  TITLE_FONT
} from '#/data/constants';
import { t } from '#/data/i18n';
import { isDark, mainPageIndex, setMainPageIndex } from '#/data/shared-state';

let controller: AbortController;

function requestTouch() {
  controller = new AbortController();
  const previousPageIndex = mainPageIndex();
  // In case of incorrect PIN, PSCS usually returns an error in less than 10ms,
  // but if the PIN is correct, PCSC stays silent until user touches the key sensor.
  // We assume that if there was no error within the initial 50ms, PIN must be correct and we prompt the user to tap the key.
  setTimeout(50).then(() => {
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
        <group title={t('userPresence')} style={{ width: 400, height: 400 }}>
          <container style={{ flex: 1 }}>
            <Expand />
            <container style={{ flexDirection: 'column' }}>
              <label
                attributedText={AttributedText.create(t('tapToComplete'), {
                  align: 'center',
                  font: TITLE_FONT
                })}
                style={{ 'margin-bottom': 50 }}
              />
              <Image
                src={touchImage}
                size={{ height: 100, width: 100 }}
                scale={5}
                {...(process.platform === 'linux' && isDark()
                  ? { tint: DARK_MODE_FONT_COLOR }
                  : {})}
              />
              <button
                title={t('cancel')}
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
