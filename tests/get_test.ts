import { assertEquals } from "@std/assert";
import { createCalendarFeedAggregator } from "../src/main.ts";
import { EVENT1, EVENT2, EVENT3, INFO, PREFIX } from "./constants.ts";

Deno.test("first", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  assertEquals(feed.get(EVENT1.id), EVENT1);
});

Deno.test("second", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  assertEquals(feed.get(EVENT2.id), EVENT2);
});

Deno.test("third", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  assertEquals(feed.get(EVENT3.id), EVENT3);
});

Deno.test("non-existent", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  assertEquals(feed.get("foo"), undefined);
});
