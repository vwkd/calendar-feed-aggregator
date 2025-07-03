import type { ICalEventData } from "ical-generator";

/**
 * Feed options
 */
export interface Options {
  /** Current date */
  currentDate?: SharedDate;
}

/**
 * Shared date
 *
 * - allows to set deterministic value of date, e.g. for testing
 * - user can mutate `value` property of argument to change date
 */
// todo: make such user can change but library can only read
export interface SharedDate {
  /** Date to share */
  value: Date;
}

/**
 * Calendar feed event
 *
 * - is narrowed down copy of `ICalEventData`
 */
export interface CalendarFeedEvent extends ICalEventData {
  id: string;
  start: Date | string;
  end?: Date | string | null;
}
