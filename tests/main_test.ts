import { assertEquals } from "@std/assert";
import { createCalendarFeedAggregator } from "../src/main.ts";
import { EXPECTED_EMPTY, INFO, PREFIX } from "./constants.ts";

Deno.test("create", async () => {
  using feed = await createCalendarFeedAggregator(":memory:", PREFIX, INFO);

  const actual = feed.toString();

  assertEquals(actual, EXPECTED_EMPTY);
});
