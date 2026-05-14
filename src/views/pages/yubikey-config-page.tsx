import { AttributedText, type Window } from 'gui';
import { createSignal } from 'solid-js';
import yubiKeyImage from '#/assets/img/yubikey.png';
import { TITLE_FONT } from '#/data/constants';
import { t } from '#/data/i18n';
import { generate, getSlots, type Slot } from '#/service/yubikey-service';
import { Image } from '#/views/components/image';
import { Router } from '#/views/components/router';
import { YubiKeyConfigTable } from '#/views/components/yubikey-config-table';
import { Expand } from '../components/expand';

function YubiKeyConfigPage(props: { mainWindow: Window; window: Window }) {
  const [slots, setSlots] = createSignal<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = createSignal<Slot | null>(null);

  const addSlots = (newSlots: Slot[]) => {
    if (JSON.stringify(newSlots) !== JSON.stringify(slots()))
      setSlots(newSlots);
  };

  getSlots().then(addSlots).catch(console.error);
  const interval = setInterval(async () => {
    getSlots().then(addSlots).catch(console.error);
  }, 3000);

  function cleanup() {
    clearInterval(interval);
  }

  props.window.onClose.connect(cleanup);

  return (
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
            <Router selectedPageIndex={() => 0}>
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
            </Router>
          </group>
          <container
            style={{
              flexDirection: 'row',
              'margin-top': 10,
              'margin-bottom': 10
            }}
          >
            <Expand />
            <button
              enabled={selectedSlot() !== null}
              onClick={() => {
                // generate({ id: 0x88, objectId: 0x005fc113 }, '');
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
  );
}

export { YubiKeyConfigPage };
