# README

iCalendar feed aggregator



## Features

- stateful iCalendar feed
- cache items using Deno KV
- update existing items
- expire items



## Usage

### Create feed

```js
import { createCalendarFeedAggregator } from "@vwkd/calendar-feed-aggregator";

const path = ":memory:";
const prefix = ["my", "example", "feed"];

using feed = await createCalendarFeedAggregator(
  path,
  prefix,
  {
    name: "My Example Feed",
    url: "https://example.org",
  },
);

await feed.add({
  id: "1",
  start: "2099-12-31T01:02:03Z",
  end: "2099-12-31T02:03:04Z",
  summary: "First event",
  description: "This is the first event.",
  location: "first location",
  url: "https://example.org/first-event",
});

await feed.add(
  {
    id: "2",
    start: "2099-12-31T03:04:05Z",
    end: "2099-12-31T04:05:06Z",
    summary: "Second event",
    description: "This is the second event.",
    location: "second location",
    url: "https://example.org/second-event",
  },
  {
    id: "3",
    start: "2099-12-31T05:06:07Z",
    end: "2099-12-31T06:07:08Z",
    summary: "Third event",
    description: "This is the third event.",
    location: "third location",
    url: "https://example.org/third-event",
  },
);

const str = feed.toString();
```
