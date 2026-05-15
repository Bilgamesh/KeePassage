import { AttributedText, MessageBox, type Window } from 'gui';
import { createSignal } from 'solid-js';
import yubiKeyImage from '#/assets/img/yubikey.png';
import { TITLE_FONT } from '#/data/constants';
import { t } from '#/data/i18n';
import {
  deleteCertificate,
  generateCertificate,
  getSlots,
  type Slot
} from '#/service/yubikey';
import { showError } from '#/utils/message-box';
import { Expand } from '#/views/components/expand';
import { Image } from '#/views/components/image';
import { Navigator, Router } from '#/views/components/router';
import { YubiKeyConfigTable } from '#/views/components/yubikey-config-table';
import { PinentryPage, requestPin } from '#/views/pages/pinentry';
import { requestTouch, TouchPage } from '#/views/pages/touch';

function YubiKeyConfigPage(props: { window: Window }) {
  const [slots, setSlots] = createSignal<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = createSignal<Slot | null>(null);

  const addSlots = (newSlots: Slot[]) => {
    if (JSON.stringify(newSlots) !== JSON.stringify(slots()))
      setSlots(newSlots);
  };

  const tryGetSlots = () =>
    getSlots().catch((error) => {
      console.error(error);
      return [] as Slot[];
    });

  const refreshSlots = () => tryGetSlots().then(addSlots);

  refreshSlots();
  const interval = setInterval(refreshSlots, 3000);
  const cleanup = () => clearInterval(interval);
  props.window.onClose.connect(cleanup);

  const navigator = new Navigator({
    KEY_SELECTION: 0,
    PINTENTRY: 1,
    TOUCH: 2
  });

  return (
    <Router navigator={navigator}>
      <container style={{ flex: 1 }}>
        <container style={{ flex: 5, flexDirection: 'row', 'margin-top': 20 }}>
          <Image size={{ height: 200, width: 200 }} src={yubiKeyImage} />
          <container
            style={{
              flex: 1,
              flexDirection: 'column',
              'margin-right': 20
            }}
          >
            <label
              attributedText={AttributedText.create(t('configureYubikey'), {
                font: TITLE_FONT,
                align: 'start'
              })}
              style={{ 'margin-left': 10 }}
            />
            <group style={{ flex: 3 }} title={t('generateIdentity')}>
              <container style={{ flex: 1, margin: 5 }}>
                <label
                  align="start"
                  style={{ 'margin-bottom': 5 }}
                  text={t('pleaseSelectSlot')}
                />
                <YubiKeyConfigTable
                  onSelection={setSelectedSlot}
                  slots={slots}
                />
              </container>
            </group>
            <container
              style={{
                flexDirection: 'row',
                'margin-top': 10,
                'margin-bottom': 10
              }}
            >
              <button
                enabled={typeof selectedSlot()?.publicKey === 'string'}
                onClick={async () => {
                  const slot = selectedSlot()!;
                  const msgBox = MessageBox.create();
                  msgBox.setTitle(t('areYouSure'));
                  msgBox.setType('warning');
                  msgBox.setText(
                    t('areYouSureDeleteCert').replace('{}', slot.name)
                  );
                  msgBox.addButton(t('cancel'), -1);
                  msgBox.addButton(t('yesForSure'), 1);
                  if (msgBox.runForWindow(props.window) === -1) return;
                  const pin = await requestPin(
                    navigator,
                    slot.serial,
                    null,
                    `${t('delete')} ${slot.name}`
                  );
                  navigator.pop();
                  if (pin)
                    deleteCertificate({ slot, pin }).catch((err) =>
                      showError(props.window, err)
                    );
                }}
                style={{
                  height: 30,
                  width: 100,
                  'margin-left': 10
                }}
                title={t('delete')}
              />
              <Expand />
              <button
                enabled={selectedSlot() !== null}
                onClick={async () => {
                  const pin = await requestPin(
                    navigator,
                    selectedSlot()!.serial,
                    null,
                    t('generateIdentity')
                  );
                  if (!pin) return navigator.pop();
                  const signal = requestTouch(navigator);
                  signal.addEventListener('abort', () => {
                    navigator.replace({
                      from: (p) => p.TOUCH,
                      to: (p) => p.KEY_SELECTION
                    });
                  });
                  try {
                    await generateCertificate({ slot: selectedSlot()!, pin });
                  } catch (err) {
                    if (!signal.aborted) showError(props.window, err);
                  } finally {
                    navigator.replace({
                      from: (p) => [p.PINTENTRY, p.TOUCH],
                      to: (p) => p.KEY_SELECTION
                    });
                  }
                }}
                style={{
                  height: 30,
                  width: 100,
                  'margin-left': 10
                }}
                title={t('continue')}
              />
              <button
                onClick={() => {
                  props.window.close();
                }}
                style={{ height: 30, width: 60, 'margin-left': 10 }}
                title={t('cancel')}
              />
            </container>
          </container>
        </container>
      </container>
      <PinentryPage navigator={navigator} window={props.window} />
      <TouchPage window={props.window} />
    </Router>
  );
}

export { YubiKeyConfigPage };
