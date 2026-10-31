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
import { render, screen, userEvent } from 'spec/helpers/testing-library';
import { ExportToCSVDropdown } from './index';
import { ExportFilterMetadataMode } from 'src/utils/export';

const exportCSVOriginal = jest.fn();
const exportCSVPivoted = jest.fn();

const setup = () =>
  render(
    <ExportToCSVDropdown
      exportCSVOriginal={exportCSVOriginal}
      exportCSVPivoted={exportCSVPivoted}
    >
      <div>.CSV</div>
    </ExportToCSVDropdown>,
  );

test('Dropdown button with menu renders', async () => {
  setup();

  expect(screen.getByText('.CSV')).toBeVisible();

  await userEvent.click(screen.getByText('.CSV'));
  expect(screen.getByRole('menu')).toBeInTheDocument();
  expect(screen.getByText('Original')).toBeInTheDocument();
  expect(screen.getByText('Pivoted')).toBeInTheDocument();
});

test('Call export csv original on click', async () => {
  setup();

  await userEvent.click(screen.getByText('.CSV'));
  await userEvent.hover(screen.getByText('Original'));
  await userEvent.click(await screen.findByText('Without filter metadata'));

  expect(exportCSVOriginal).toHaveBeenCalledWith(ExportFilterMetadataMode.None);
});

test('Passes inline metadata mode to original CSV export', async () => {
  setup();

  await userEvent.click(screen.getByText('.CSV'));
  await userEvent.hover(screen.getByText('Original'));
  await userEvent.click(
    await screen.findByText('Include filters in metadata comments'),
  );
  expect(exportCSVOriginal).toHaveBeenCalledWith(
    ExportFilterMetadataMode.Inline,
  );
});

test('Passes separate metadata mode to original CSV export', async () => {
  setup();

  await userEvent.click(screen.getByText('.CSV'));
  await userEvent.hover(screen.getByText('Original'));
  await userEvent.click(
    await screen.findByText('Include filters as a separate file'),
  );
  expect(exportCSVOriginal).toHaveBeenCalledWith(
    ExportFilterMetadataMode.Separate,
  );
});

test('Call export csv pivoted on click', async () => {
  setup();

  await userEvent.click(screen.getByText('.CSV'));
  await userEvent.hover(screen.getByText('Pivoted'));
  await userEvent.click(await screen.findByText('Without filter metadata'));

  expect(exportCSVPivoted).toHaveBeenCalledWith(
    ExportFilterMetadataMode.None,
  );
});

test('Passes filter metadata mode to pivoted CSV export', async () => {
  setup();

  await userEvent.click(screen.getByText('.CSV'));
  await userEvent.hover(screen.getByText('Pivoted'));
  await userEvent.click(
    await screen.findByText('Include filters as a separate file'),
  );

  expect(exportCSVPivoted).toHaveBeenCalledWith(
    ExportFilterMetadataMode.Separate,
  );
});
