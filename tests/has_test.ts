import { assertEquals } from "@std/assert";
import { createCalendarFeedAggregator } from "../src/main.ts";
import { EVENT1, EVENT2, EVENT3, INFO, PREFIX } from "./constants.ts";

Deno.test("first", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  assertEquals(feed.has(EVENT1.id), true);
});

Deno.test("second", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  assertEquals(feed.has(EVENT2.id), true);
});

Deno.test("third", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  assertEquals(feed.has(EVENT3.id), true);
});
Deno.test("non-existent", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  assertEquals(feed.has("foo"), false);
});
