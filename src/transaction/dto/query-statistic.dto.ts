import { DATE_FILTER_TYPE } from '../models/date-filter-type';

export interface QueryStatisticDto {
  filterType: DATE_FILTER_TYPE,
  startDate: string,
  endDate: string
}
