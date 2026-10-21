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
import {
  fetchTimeRange,
  NO_TIME_RANGE,
  type JsonObject,
} from '@superset-ui/core';
import AdhocFilter from 'src/explore/components/controls/FilterControl/AdhocFilter';
import { ExpressionTypes } from 'src/explore/components/controls/FilterControl/types';
import { guessFrame } from 'src/explore/components/controls/DateFilterControl/utils';
import { Operators } from 'src/explore/constants';
import type { ExportFilterValue } from './export';

export interface ExportQueryFilter {
  col?: string;
  val?: unknown;
  formattedVal?: unknown;
}

const getStringValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map(getStringValue).join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value) ?? '';
  }
  return String(value);
};

const getAdhocFilterValue = async (filter: AdhocFilter): Promise<string> => {
  const subject =
    typeof filter.subject === 'string'
      ? filter.subject
      : filter.subject?.column_name;

  if (
    filter.operator === Operators.TemporalRange &&
    filter.expressionType === ExpressionTypes.Simple
  ) {
    if (filter.comparator === NO_TIME_RANGE) {
      return `${subject} (${NO_TIME_RANGE})`;
    }
    if (typeof filter.comparator === 'string' && subject) {
      const { value, error } = await fetchTimeRange(
        filter.comparator,
        subject,
      );
      return error || typeof value !== 'string'
        ? `${subject} (${filter.comparator})`
        : value || `${subject} (${filter.comparator})`;
    }
  }

  return filter.getDefaultLabel();
};

export const getExportFilterValues = async (
  formData: JsonObject,
  pillValues: ExportFilterValue[] = [],
  additionalFilters: ExportQueryFilter[] = [],
): Promise<ExportFilterValue[]> => {
  const values = [...pillValues];
  const add = (filter: ExportFilterValue) => {
    if (
      filter.value.length > 0 &&
      !values.some(
        existing =>
          existing.label === filter.label && existing.value === filter.value,
      )
    ) {
      values.push(filter);
    }
  };

  const adhocFilters = Array.isArray(formData.adhoc_filters)
    ? formData.adhoc_filters
    : [];
  for (const rawFilter of adhocFilters) {
    if (
      typeof rawFilter !== 'object' ||
      rawFilter === null ||
      Array.isArray(rawFilter)
    ) {
      continue;
    }
    const filter = new AdhocFilter(rawFilter as Record<string, unknown>);
    const label =
      typeof filter.subject === 'string'
        ? filter.subject
        : filter.subject?.column_name;
    const value = await getAdhocFilterValue(filter);
    add({
      label:
        label ||
        (filter.expressionType === ExpressionTypes.Sql
          ? 'Custom SQL filter'
          : 'Filter'),
      value,
    });
  }

  const timeRange =
    typeof formData.time_range === 'string' ? formData.time_range : undefined;
  if (timeRange && timeRange !== NO_TIME_RANGE) {
    const frame = guessFrame(timeRange);
    let value = timeRange;
    if (!['Common', 'Calendar', 'Current', 'No filter'].includes(frame)) {
      const { value: resolvedValue, error } = await fetchTimeRange(
        timeRange,
        'col',
        undefined,
        typeof formData.time_range_display_format === 'string'
          ? formData.time_range_display_format
          : undefined,
      );
      if (!error && typeof resolvedValue === 'string' && resolvedValue) {
        value = resolvedValue;
      }
    }
    add({ label: 'Time range', value });
  }

  const formFilters = formData.extra_form_data;
  if (
    pillValues.length === 0 &&
    typeof formFilters === 'object' &&
    formFilters !== null &&
    !Array.isArray(formFilters) &&
    Array.isArray((formFilters as JsonObject).filters)
  ) {
    additionalFilters = [
      ...additionalFilters,
      ...((formFilters as JsonObject).filters as ExportQueryFilter[]),
    ];
  }

  additionalFilters.forEach(filter => {
    const label = typeof filter.col === 'string' ? filter.col : 'Filter';
    const value = getStringValue(
      filter.formattedVal !== undefined ? filter.formattedVal : filter.val,
    );
    add({ label, value });
  });

  return values;
};
