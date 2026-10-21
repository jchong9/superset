/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { ReactChild, useCallback, Key } from 'react';

import { t } from '@apache-superset/core/translation';
import { Dropdown } from '@superset-ui/core/components';
import { ExportFilterMetadataMode } from 'src/utils/export';

enum MenuKeys {
  ExportOriginal = 'export_original',
  ExportPivoted = 'export_pivoted',
}

interface ExportToCSVButtonProps {
  exportCSVOriginal: (mode: ExportFilterMetadataMode) => void;
  exportCSVPivoted: (mode: ExportFilterMetadataMode) => void;
  children: ReactChild;
}

const metadataItems = (
  exportType: string,
  onExport: (mode: ExportFilterMetadataMode) => void,
) => [
  {
    key: `${exportType}-none`,
    label: t('Without filter metadata'),
    onClick: () => onExport(ExportFilterMetadataMode.None),
  },
  {
    key: `${exportType}-inline`,
    label: t('Include filters in metadata comments'),
    onClick: () => onExport(ExportFilterMetadataMode.Inline),
  },
  {
    key: `${exportType}-separate`,
    label: t('Include filters as a separate file'),
    onClick: () => onExport(ExportFilterMetadataMode.Separate),
  },
];

export const ExportToCSVDropdown = ({
  exportCSVOriginal,
  exportCSVPivoted,
  children,
}: ExportToCSVButtonProps) => {
  const handleMenuClick = useCallback(
    ({ key }: { key: Key }) => {
      switch (key) {
        case MenuKeys.ExportOriginal:
          exportCSVOriginal(ExportFilterMetadataMode.None);
          break;
        case MenuKeys.ExportPivoted:
          exportCSVPivoted(ExportFilterMetadataMode.None);
          break;
        default:
          break;
      }
    },
    [exportCSVPivoted, exportCSVOriginal],
  );

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        onClick: handleMenuClick,
        selectable: false,
        items: [
          {
            key: MenuKeys.ExportOriginal,
            label: t('Original'),
            children: metadataItems('original', exportCSVOriginal),
          },
          {
            key: MenuKeys.ExportPivoted,
            label: t('Pivoted'),
            children: metadataItems('pivoted', exportCSVPivoted),
          },
        ],
      }}
    >
      {children}
    </Dropdown>
  );
};
