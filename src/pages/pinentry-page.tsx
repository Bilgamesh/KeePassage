import { AttributedText, type Entry } from 'gui';
import { createEffect, createSignal } from 'solid-js';
import { Expand } from '#/components/expand';
import {
  APP_NAME,
  LARGE_BUTTON_STYLE,
  PAGE_INDEXES,
  TITLE_FONT
} from '#/data/constants';
import { t } from '#/data/i18n';
import {
  mainPageIndex,
  selectedDbPath,
  setMainPageIndex
} from '#/data/shared-state';
import { createListeners } from '#/utils/listen-util';

type Pin = number | null;

const pinListeners = createListeners<Pin>();
let entryNode: Entry;
let controller: AbortController;

const [serial, setSerial] = createSignal<number | null>(null);
const [purpose, setPurpose] = createSignal(`${APP_NAME} Database`);

async function requestPin(serial: number, entryName?: string) {
  if (entryName) {
    setPurpose(`${t('unlockEntry')}: ${entryName}`);
  } else {
    setPurpose(t('unlockDb'));
  }
  setSerial(serial);
  controller = new AbortController();
  setMainPageIndex(PAGE_INDEXES.PINTENTRY);
  entryNode.focus();
  try {
    const pin = await pinListeners.waitForValue({ signal: controller?.signal });
    return pin;
  } catch (err) {
    console.error(`Failed to get pin: ${err}`);
    return null;
  }
}

function PinentryPage() {
  const [pin, setPin] = createSignal<Pin>(null);

  function validatePin(pin: string) {
    if (pin.length > 8) {
      return false;
    }
    return /^\d+$/.test(pin);
  }

  createEffect(() => {
    mainPageIndex();
    setPin(null);
  });

  return (
    <container style={{ flex: 1, flexDirection: 'column' }}>
      <Expand direction="column" />
      <container style={{ flexDirection: 'row', height: 280 }}>
        <Expand direction="row" />
        <container style={{ width: 650 }}>
          <label
            attributedText={AttributedText.create(purpose(), {
              align: 'start',
              font: TITLE_FONT
            })}
            align="start"
          />
          <label
            text={selectedDbPath()}
            align="start"
            style={{ 'margin-top': 5, 'margin-bottom': 20 }}
          />
          <group title={t('pinEntry')} style={{ flex: 1 }}>
            <container style={{ height: 600 }}>
              <container style={{ margin: 20, height: 170 }}>
                <label
                  text={`${t('enterPinFor')} ${serial()}:`}
                  align="start"
                />
                <password
                  ref={(element) => {
                    entryNode = element.node;
                  }}
                  style={{ 'margin-top': 5, 'margin-bottom': 30 }}
                  text={`${pin() || ''}`}
                  onTextChange={(entry) => {
                    const text = entry.getText();
                    if (text) {
                      if (validatePin(text)) {
                        setPin(Number(text));
                      } else {
                        entry.setText(`${pin() || ''}`);
                      }
                    } else {
                      setPin(null);
                    }
                  }}
                  onKeyDown={(_self, ev) => {
                    // Silence error sound by returning true
                    if (ev.key === 'Enter') {
                      if (process.platform === 'linux') {
                        // Auto submit doesn't work on Linux by default
                        if (pin() !== null) {
                          pinListeners.notifyListeners(pin());
                        }
                      }
                      return true;
                    }
                    if (ev.key === 'Backspace' && pin() === null) {
                      return true;
                    }
                    return false;
                  }}
                  onActivate={() => {
                    if (pin() !== null) {
                      pinListeners.notifyListeners(pin());
                    }
                  }}
                />
                <Expand direction="column" />
                <container
                  style={{ flexDirection: 'row', 'margin-bottom': 10 }}
                >
                  <Expand direction="row" />
                  <button
                    title={t('submit')}
                    enabled={pin() !== null}
                    style={LARGE_BUTTON_STYLE}
                    onClick={() => pinListeners.notifyListeners(pin())}
                  />
                  <button
                    title={t('cancel')}
                    style={{ ...LARGE_BUTTON_STYLE, 'margin-left': 10 }}
                    onClick={() => {
                      controller?.abort('Cancel');
                    }}
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
