import { AttributedText } from 'gui';
import type { Accessor, Setter } from 'solid-js';

import { t } from '@/data/i18n';

function DatabaseGeneralInfo(props: {
  dbName: Accessor<string>;
  setDbName: Setter<string>;
  description: Accessor<string>;
  setDescription: Setter<string>;
}) {
  return (
    <container style={{ flex: 1, 'margin-top': 10 }}>
      <container style={{ flexDirection: 'row' }}>
        <label
          attributedText={AttributedText.create(t('fillInDisplayName'), {})}
          style={{ 'margin-left': 10 }}
        />
      </container>
      <container style={{ flexDirection: 'row', 'margin-top': 20 }}>
        <label text={t('dbName')} style={{ width: 100, 'margin-left': 10 }} align="start" />
        <entry
          style={{ flex: 1, 'margin-right': 10 }}
          text={props.dbName()}
          onTextChange={(self) => {
            props.setDbName(self.getText());
          }}
        />
      </container>
      <container style={{ flexDirection: 'row', 'margin-top': 10 }}>
        <label text={t('description')} style={{ width: 100, 'margin-left': 10 }} align="start" />
        <entry
          style={{ flex: 1, 'margin-right': 10 }}
          text={props.description()}
          onTextChange={(self) => {
            props.setDescription(self.getText());
          }}
        />
      </container>
    </container>
  );
}

export { DatabaseGeneralInfo };
