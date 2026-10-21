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

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { JsonObject, LatestQueryFormData } from '@superset-ui/core';
import { Button, Dropdown } from '@superset-ui/core/components';
import { Icons } from '@superset-ui/core/components/Icons';
import { t } from '@apache-superset/core/translation';
import { css, useTheme } from '@apache-superset/core/theme';
import { StreamingExportModal } from 'src/components/StreamingExportModal';
import { Slice } from 'src/types/Chart';
import type { RootState } from 'src/views/store';
import { useExploreDataExport } from '../useExploreAdditionalActionsMenu/useExploreDataExport';
import { ExportFilterMetadataMode } from 'src/utils/export';

const getFilterMetadataLabel = (mode: ExportFilterMetadataMode): string => {
  switch (mode) {
    case ExportFilterMetadataMode.None:
      return t('Without filter metadata');
    case ExportFilterMetadataMode.Inline:
      return t('Include filters in metadata comments');
    case ExportFilterMetadataMode.Separate:
      return t('Include filters as a separate file');
    default:
      return mode;
  }
};

interface StandaloneDownloadControlProps {
  latestQueryFormData: LatestQueryFormData;
  canDownload: boolean;
  slice?: Slice;
  ownState?: JsonObject;
}

const StandaloneDownloadControl = ({
  latestQueryFormData,
  canDownload,
  slice,
  ownState,
}: StandaloneDownloadControlProps) => {
  const theme = useTheme();
  const locale = useSelector((state: RootState) => state.common?.locale);

  const { exportCSV, exportJson, exportExcel, streamingExportState } =
    useExploreDataExport({
      latestQueryFormData,
      canDownloadCSV: canDownload,
      slice,
      ownState,
    });

  const downloadMenuItems = useMemo(
    () => [
      {
        key: 'export_csv',
        label: t('Export to .CSV'),
        children: Object.values(ExportFilterMetadataMode).map(mode => ({
          key: `csv-${mode}`,
          label: getFilterMetadataLabel(mode),
          onClick: () => exportCSV(mode),
        })),
      },
      {
        key: 'export_json',
        label: t('Export to .JSON'),
        onClick: exportJson,
      },
      {
        key: 'export_excel',
        label: t('Export to Excel'),
        onClick: exportExcel,
      },
    ],
    [exportCSV, exportExcel, exportJson, locale],
  );

  return (
    <>
      <Dropdown
        trigger={['click']}
        menu={{
          selectable: false,
          items: downloadMenuItems,
        }}
      >
        <Button
          aria-label={t('Download')}
          data-test="standalone-download-button"
          css={css`
            position: absolute;
            top: ${theme.sizeUnit * 2}px;
            right: ${theme.sizeUnit * 2}px;
            z-index: 1;
          `}
        >
          <Icons.DownloadOutlined />
        </Button>
      </Dropdown>

      <StreamingExportModal
        visible={streamingExportState.isVisible}
        onCancel={streamingExportState.onCancel}
        onRetry={streamingExportState.onRetry}
        onDownload={streamingExportState.onDownload}
        progress={streamingExportState.progress}
      />
    </>
  );
};

export default StandaloneDownloadControl;
