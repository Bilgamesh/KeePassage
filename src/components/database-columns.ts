import { t } from '#/data/i18n';
import type { TableColumn } from '#/renderer/types';

function DatabaseColumns() {
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
