import { assertEquals } from "@std/assert";
import { createCalendarFeedAggregator } from "../src/main.ts";
import {
  EVENT1,
  EVENT2,
  EVENT3,
  EXPECTED_FULL,
  INFO,
  PATH,
  PREFIX,
} from "./constants.ts";

Deno.test("add", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(EVENT1);
  await feed.add(...[EVENT2, EVENT3]);

  const actual = feed.toString();

  assertEquals(actual, EXPECTED_FULL);
});

Deno.test("persist", async () => {
  try {
    using feed = await createCalendarFeedAggregator(PATH, PREFIX, INFO);
    await feed.add(EVENT1);
    await feed.add(...[EVENT2, EVENT3]);

    using feed2 = await createCalendarFeedAggregator(PATH, PREFIX, INFO);

    const actual = feed2.toString();

    assertEquals(actual, EXPECTED_FULL);
  } finally {
    await Deno.remove(PATH);
  }
});

Deno.test("order", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT2, EVENT3]);
  await feed.add(EVENT1);

  const actual = feed.toString();

  assertEquals(actual, EXPECTED_FULL);
});
