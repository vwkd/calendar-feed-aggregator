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

Deno.test("persist", async () => {
  try {
    using feed = await createCalendarFeedAggregator(
      PATH,
      PREFIX,
      INFO,
    );
    await feed.add(...[EVENT1, EVENT2, EVENT3]);

    await feed.remove(EVENT2.id);

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

Deno.test("first", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  await feed.remove(EVENT1.id);

  using feedExpected = await createCalendarFeedAggregator(
    ":memory:",
    PREFIX2,
    INFO,
  );
  await feedExpected.add(...[EVENT2, EVENT3]);

  assertEquals(feed.toString(), feedExpected.toString());
});

Deno.test("second", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  await feed.remove(EVENT2.id);

  using feedExpected = await createCalendarFeedAggregator(
    ":memory:",
    PREFIX2,
    INFO,
  );
  await feedExpected.add(...[EVENT1, EVENT3]);

  assertEquals(feed.toString(), feedExpected.toString());
});
Deno.test("third", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  await feed.remove(EVENT3.id);

  using feedExpected = await createCalendarFeedAggregator(
    ":memory:",
    PREFIX2,
    INFO,
  );
  await feedExpected.add(...[EVENT1, EVENT2]);

  assertEquals(feed.toString(), feedExpected.toString());
});
Deno.test("non-existent", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);
  await feed.add(...[EVENT1, EVENT2, EVENT3]);

  await feed.remove("foo");

  using feedExpected = await createCalendarFeedAggregator(
    ":memory:",
    PREFIX2,
    INFO,
  );
  await feedExpected.add(...[EVENT1, EVENT2, EVENT3]);

  assertEquals(feed.toString(), feedExpected.toString());
});
