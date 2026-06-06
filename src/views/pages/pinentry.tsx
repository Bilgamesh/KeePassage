import { AttributedText, type Entry } from 'gui';
import { createSignal, onCleanup } from 'solid-js';
import { APP_NAME, LARGE_BUTTON_STYLE, TITLE_FONT } from '#/data/constants';
import { t } from '#/data/i18n';
import { selectedDbPath } from '#/data/shared-state';
import { createListeners } from '#/utils/listen';
import { Expand } from '#/views/components/expand';
import type { Navigator } from '#/views/components/router';

type NavigationIndex = { PINENTRY: number };

const pinListeners = createListeners<string | null>();
const entryNodes: Record<string, Entry> = {};
let controller: AbortController;

const [serial, setSerial] = createSignal<number | null>(null);
const [purpose, setPurpose] = createSignal(`${APP_NAME} Database`);

async function requestPin<T extends NavigationIndex>(
  navigator: Navigator<T>,
  serial: number,
  entryName?: string | null,
  purpose?: string
) {
  if (!controller?.signal.aborted) controller?.abort(); // Abort potential parallel PIN request in other window
  if (entryName) setPurpose(`${t('unlockEntry')}: ${entryName}`);
  else if (purpose) setPurpose(purpose);
  else setPurpose(t('unlockDb'));

  setSerial(serial);
  const newAbortController = new AbortController();
  navigator.push({
    index: 'PINENTRY',
    cleanup: () =>
      newAbortController.signal.aborted
        ? null
        : controller.abort('Page cleanup')
  });
  entryNodes[navigator.id]?.focus();
  controller = newAbortController;
  try {
    const pin = await pinListeners.waitForValue({ signal: controller?.signal });
    return pin;
  } catch (err) {
    console.error(`Failed to get pin: ${err}`);
    return null;
  }
}

function PinentryPage<T extends NavigationIndex>(props: {
  navigator: Navigator<T>;
}) {
  const [pin, setPin] = createSignal<string | null>(null);

  function validatePin(pin: string) {
    if (pin.length > 8) return false;
    return /^\d+$/.test(pin);
  }

  props.navigator.subscribe(() => {
    setPin(null);
  });

  onCleanup(() => {
    controller?.abort('Cancel');
    delete entryNodes[props.navigator.id];
  });

  return (
    <container style={{ flex: 1, flexDirection: 'column' }}>
      <Expand direction="column" />
      <container style={{ flexDirection: 'row', height: 280 }}>
        <Expand direction="row" />
        <container style={{ width: 650 }}>
          <label
            align="start"
            attributedText={AttributedText.create(purpose(), {
              align: 'start',
              font: TITLE_FONT
            })}
          />
          <label
            align="start"
            style={{ 'margin-top': 5, 'margin-bottom': 20 }}
            text={selectedDbPath()}
          />
          <group style={{ flex: 1 }} title={t('pinEntry')}>
            <container style={{ height: 600 }}>
              <container style={{ margin: 20, height: 170 }}>
                <label
                  align="start"
                  text={`${t('enterPinFor')} ${serial()}:`}
                />
                <password
                  onActivate={() => {
                    if (pin() !== null) pinListeners.notifyListeners(pin());
                  }}
                  onKeyDown={(_self, ev) => {
                    // Silence error sound by returning true on Enter
                    if (ev.key === 'Enter') {
                      // Auto submit doesn't work on Linux by default
                      if (process.platform === 'linux' && pin() !== null)
                        pinListeners.notifyListeners(pin());
                      return true;
                    }
                    // Silence error sound by returning true on empty delete
                    if (ev.key === 'Backspace' && pin() === null) return true;
                    return false;
                  }}
                  onTextChange={(entry) => {
                    const text = entry.getText();
                    if (text) {
                      if (validatePin(text)) setPin(text);
                      else entry.setText(`${pin() || ''}`);
                    } else setPin(null);
                  }}
                  ref={(element) => {
                    entryNodes[props.navigator.id] = element.node;
                  }}
                  style={{ 'margin-top': 5, 'margin-bottom': 30 }}
                  text={`${pin() || ''}`}
                />
                <Expand direction="column" />
                <container
                  style={{ flexDirection: 'row', 'margin-bottom': 10 }}
                >
                  <Expand direction="row" />
                  <button
                    enabled={pin() !== null}
                    onClick={() => pinListeners.notifyListeners(pin())}
                    style={LARGE_BUTTON_STYLE}
                    title={t('submit')}
                  />
                  <button
                    onClick={() => {
                      controller?.abort('Cancel');
                    }}
                    style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
                    title={t('cancel')}
                  />
                </container>
              </container>
            </container>
          </group>
        </container>
        <Expand direction="row" />
      </container>
      <Expand direction="column" />
    </container>
  );
}

export { PinentryPage, requestPin };
