import { assertEquals } from "@std/assert";
import { createCalendarFeedAggregator } from "../src/main.ts";
import {
  EVENT1,
  EVENT2,
  EVENT3,
  INFO,
  PATH,
  PREFIX,
  PREFIX2,
} from "./constants.ts";

Deno.test("all persist", async () => {
  try {
    using feed = await createCalendarFeedAggregator(
      PATH,
      PREFIX,
      INFO,
    );
    await feed.add(...[EVENT1, EVENT2, EVENT3]);

    await feed.removeAll();

    using feedActual = await createCalendarFeedAggregator(
      PATH,
      PREFIX,
      INFO,
    );

    assertEquals(feedActual.toString(), feed.toString());
  } finally {
    await Deno.remove(PATH);
  }
});

Deno.test("all", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  await feed.removeAll();

  using feedExpected = await createCalendarFeedAggregator(
    ":memory:",
    PREFIX2,
    INFO,
  );

  assertEquals(feed.toString(), feedExpected.toString());
});

Deno.test("all, empty", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);

  await feed.removeAll();

  using feedExpected = await createCalendarFeedAggregator(
    ":memory:",
    PREFIX2,
    INFO,
  );

  assertEquals(feed.toString(), feedExpected.toString());
});
