import { getTranslator } from '#/data/i18n';
import { useAppContext } from '#/data/shared-state';
import type { TableColumn } from '#/renderer/types';

function DatabaseColumns() {
  const state = useAppContext();
  const t = getTranslator(state);

  const columns: TableColumn[] = [
    {
      label: t('title'),
      options: {
        type: 'text',
        width: 150
      }
    },
    {
      label: t('username'),
      options: {
        type: 'text',
        width: 150
      }
    },
    {
      label: t('url2'),
      options: {
        type: 'text',
        width: 150
      }
    },
    {
      label: t('notes2'),
      options: {
        type: 'text',
        width: 150
      }
    },
    {
      label: t('modified'),
      options: {
        type: 'text',
        width: -1
      }
    }
  ];
  return columns;
}

export { DatabaseColumns };
