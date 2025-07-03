import { formatDate, type ICalCalendarData } from "ical-generator";
import type { CalendarFeedEvent } from "../src/types.ts";

export const PATH = "tests/my_example_feed.db" as const;
export const PREFIX = ["my", "example", "feed"] as const;
export const PREFIX2 = ["my2", "example", "feed"] as const;

const CURRENT_DATE = new Date();
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const DATE1_START = new Date(CURRENT_DATE.getTime() + DAY_MS);
const DATE1_END = new Date(DATE1_START.getTime() + HOUR_MS);
const DATE2_START = new Date(CURRENT_DATE.getTime() + 2 * DAY_MS);
const DATE2_END = new Date(DATE2_START.getTime() + HOUR_MS);
const DATE3_START = new Date(CURRENT_DATE.getTime() + 3 * DAY_MS);
const DATE3_END = new Date(DATE3_START.getTime() + HOUR_MS);

export const INFO: ICalCalendarData = {
  name: "My Example Feed",
  url: "https://example.org",
};

export const EVENT1: CalendarFeedEvent = {
  id: "1",
  start: DATE1_START,
  end: DATE1_END,
  summary: "First event",
  description: "This is the first event.",
  location: "first location",
  url: "https://example.org/first-event",
  stamp: CURRENT_DATE,
};

export const EVENT2: CalendarFeedEvent = {
  id: "2",
  start: DATE2_START,
  end: DATE2_END,
  summary: "Second event",
  description: "This is the second event.",
  location: "second location",
  url: "https://example.org/second-event",
  stamp: CURRENT_DATE,
};

export const EVENT3: CalendarFeedEvent = {
  id: "3",
  start: DATE3_START,
  end: DATE3_END,
  summary: "Third event",
  description: "This is the third event.",
  location: "third location",
  url: "https://example.org/third-event",
  stamp: CURRENT_DATE,
};

export const EXPECTED_EMPTY = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//sebbo.net//ical-generator//EN
URL:https://example.org
NAME:My Example Feed
X-WR-CALNAME:My Example Feed
END:VCALENDAR`
  .replaceAll(/\n/g, "\r\n");

export const EXPECTED_FULL = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//sebbo.net//ical-generator//EN
URL:https://example.org
NAME:My Example Feed
X-WR-CALNAME:My Example Feed
BEGIN:VEVENT
UID:1
SEQUENCE:0
DTSTAMP:${formatDate(null, CURRENT_DATE)}
DTSTART:${formatDate(null, DATE1_START)}
DTEND:${formatDate(null, DATE1_END)}
SUMMARY:First event
LOCATION:first location
DESCRIPTION:This is the first event.
URL;VALUE=URI:https://example.org/first-event
END:VEVENT
BEGIN:VEVENT
UID:2
SEQUENCE:0
DTSTAMP:${formatDate(null, CURRENT_DATE)}
DTSTART:${formatDate(null, DATE2_START)}
DTEND:${formatDate(null, DATE2_END)}
SUMMARY:Second event
LOCATION:second location
DESCRIPTION:This is the second event.
URL;VALUE=URI:https://example.org/second-event
END:VEVENT
BEGIN:VEVENT
UID:3
SEQUENCE:0
DTSTAMP:${formatDate(null, CURRENT_DATE)}
DTSTART:${formatDate(null, DATE3_START)}
DTEND:${formatDate(null, DATE3_END)}
SUMMARY:Third event
LOCATION:third location
DESCRIPTION:This is the third event.
URL;VALUE=URI:https://example.org/third-event
END:VEVENT
END:VCALENDAR`
  .replaceAll(/\n/g, "\r\n");
