import { setTimeout } from 'node:timers/promises';
import { AttributedText, type Window } from 'gui';
import touchIcon from '#/assets/icons/touch.png';
import { DARK_MODE_FONT_COLOR, TITLE_FONT } from '#/data/constants';
import { t } from '#/data/i18n';
import { isDark } from '#/data/shared-state';
import { Expand } from '#/views/components/expand';
import { Image } from '#/views/components/image';
import type { Navigator } from '#/views/components/router';

type NavigationIndex = { TOUCH: number };

let controller: AbortController;

function requestTouch<T extends NavigationIndex>(navigator: Navigator<T>) {
  if (!controller?.signal.aborted) controller?.abort(); // Abort potential parallel touch request in other window
  const newAbortController = new AbortController();
  const previousPageId = navigator.pageIndex();
  // In case of incorrect PIN, PSCS usually returns an error in less than 10ms,
  // but if the PIN is correct, PCSC stays silent until user touches the key sensor.
  // We assume that if there was no error within the initial 50ms, PIN must be correct and we prompt the user to tap the key.
  setTimeout(50).then(() => {
    const stillOnSamePage = navigator.isCurrentPage(() => previousPageId);
    if (!newAbortController.signal.aborted && stillOnSamePage) {
      navigator.push((pages) => ({
        index: pages.TOUCH,
        cleanup: () => {
          if (!newAbortController.signal.aborted)
            newAbortController.abort('Page cleanup');
        }
      }));
    }
  });
  controller = newAbortController;
  return controller.signal;
}

function TouchPage(props: { window: Window }) {
  props.window.onClose.connect(() => controller?.abort('Cancel'));

  return (
    <container style={{ flex: 1 }}>
      <Expand />
      <container style={{ flexDirection: 'row' }}>
        <Expand direction="row" />
        <group style={{ width: 400, height: 400 }} title={t('userPresence')}>
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
                scale={5}
                size={{ height: 100, width: 100 }}
                src={touchIcon}
                {...(process.platform === 'linux' && isDark()
                  ? { tint: DARK_MODE_FONT_COLOR }
                  : {})}
              />
              {/* <button
                onClick={() => {
                  controller.abort('Cancel');
                }}
                style={{
                  height: 30,
                  width: 300,
                  'margin-left': 45,
                  'margin-top': 100
                }}
                title={t('cancel')}
              /> */}
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
