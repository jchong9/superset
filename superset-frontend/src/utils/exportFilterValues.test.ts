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
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { fetchTimeRange } from '@superset-ui/core';
import { getExportFilterValues } from './exportFilterValues';

jest.mock('@superset-ui/core', () => ({
  ...jest.requireActual('@superset-ui/core'),
  fetchTimeRange: jest.fn(),
}));

const mockFetchTimeRange = fetchTimeRange as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

test('formats adhoc date filter values as the displayed filter pill', async () => {
  mockFetchTimeRange.mockResolvedValue({
    value: '2026-01-01 ≤ dttm < 2026-01-02',
  });

  await expect(
    getExportFilterValues({
      adhoc_filters: [
        {
          expressionType: 'SIMPLE',
          subject: 'dttm',
          operator: 'TEMPORAL_RANGE',
          comparator: '2026-01-01 : 2026-01-02',
          clause: 'WHERE',
        },
      ],
    }),
  ).resolves.toEqual([
    { label: 'dttm', value: '2026-01-01 ≤ dttm < 2026-01-02' },
  ]);
  expect(mockFetchTimeRange).toHaveBeenCalledWith(
    '2026-01-01 : 2026-01-02',
    'dttm',
  );
});

test('includes selected dashboard pill labels and values without duplicating query filters', async () => {
  await expect(
    getExportFilterValues(
      {
        extra_form_data: {
          filters: [{ col: 'region', op: 'IN', val: ['North', 'South'] }],
        },
      },
      [{ label: 'Sales region', value: 'North, South' }],
    ),
  ).resolves.toEqual([{ label: 'Sales region', value: 'North, South' }]);
});

test('resolves custom chart time ranges using the date control label format', async () => {
  mockFetchTimeRange.mockResolvedValue({
    value: '2026-01-01 ≤ col < 2026-01-02',
  });

  await expect(
    getExportFilterValues({
      time_range: '2026-01-01 : 2026-01-02',
    }),
  ).resolves.toEqual([
    { label: 'Time range', value: '2026-01-01 ≤ col < 2026-01-02' },
  ]);
});

test('uses formatted values for drill-detail query filters', async () => {
  await expect(
    getExportFilterValues(
      {},
      [],
      [{ col: 'year', val: 1996, formattedVal: '1996' }],
    ),
  ).resolves.toEqual([{ label: 'year', value: '1996' }]);
});
