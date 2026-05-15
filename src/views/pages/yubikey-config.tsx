import { AttributedText, type Window } from 'gui';
import { createSignal } from 'solid-js';
import yubiKeyImage from '#/assets/img/yubikey.png';
import { TITLE_FONT } from '#/data/constants';
import { t } from '#/data/i18n';
import { getSlots, type Slot } from '#/service/yubikey';
import { Expand } from '#/views/components/expand';
import { Image } from '#/views/components/image';
import { Navigator, Router } from '#/views/components/router';
import { YubiKeyConfigTable } from '#/views/components/yubikey-config-table';

function YubiKeyConfigPage(props: { mainWindow: Window; window: Window }) {
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
            <Router navigator={navigator}>
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
                // generate({ slot: { id: 0x88, objectId: 0x005fc113 }, pin: });
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
