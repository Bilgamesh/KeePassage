import { AttributedText } from 'gui';
import type { Accessor, Setter } from 'solid-js';
import { getTranslator } from '#/data/i18n';
import { useAppContext } from '#/data/shared-state';

function DatabaseGeneralInfo(props: {
  dbName: Accessor<string>;
  setDbName: Setter<string>;
  description: Accessor<string>;
  setDescription: Setter<string>;
}) {
  const state = useAppContext();
  const t = getTranslator(state);

  return (
    <container style={{ flex: 1, 'margin-top': 10 }}>
      <container style={{ flexDirection: 'row' }}>
        <label
          attributedText={AttributedText.create(t('fillInDisplayName'), {})}
          style={{ 'margin-left': 10 }}
        />
      </container>
      <container style={{ flexDirection: 'row', 'margin-top': 20 }}>
        <label
          align="start"
          style={{ width: 120, 'margin-left': 10 }}
          text={t('dbName')}
        />
        <entry
          onTextChange={(self) => {
            props.setDbName(self.getText());
          }}
          style={{ flex: 1, 'margin-right': 10 }}
          text={props.dbName()}
        />
      </container>
      <container style={{ flexDirection: 'row', 'margin-top': 10 }}>
        <label
          align="start"
          style={{ width: 120, 'margin-left': 10 }}
          text={t('description')}
        />
        <entry
          onTextChange={(self) => {
            props.setDescription(self.getText());
          }}
          style={{ flex: 1, 'margin-right': 10 }}
          text={props.description()}
        />
      </container>
    </container>
  );
}

export { DatabaseGeneralInfo };
