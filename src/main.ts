export type { CalendarFeedEvent, Options, SharedDate } from "./types.ts";
import { ICalCalendar, type ICalCalendarData } from "ical-generator";
import { type KvToolbox, openKvToolbox } from "@kitsonk/kv-toolbox";
import type { CalendarFeedEvent, Options, SharedDate } from "./types.ts";

const DENO_KV_MAX_BATCH_SIZE = 1000;

/**
 * iCalendar feed aggregator
 *
 * - creates iCalendar feed and persists it using Deno KV
 * - persists events with expiry of end date or start date if end date is not set
 * - order of events in feed by lexicographical order of keys
 * - beware: manually filter out expired events since expiry is earliest time after which Deno KV deletes events, don't bother to persist deletion since Deno KV will delete eventually!
 */
export class CalendarFeedAggregator implements Disposable {
  #initialized = false;
  #kv: KvToolbox;
  #prefix: readonly string[];
  #info: ICalCalendarData;
  #currentDate?: SharedDate;
  #eventsStored: Map<string, CalendarFeedEvent> = new Map();

  /**
   * Create new iCalendar feed Aggregator
   *
   * - beware: don't call constructor directly, instead use factory function `createICalFeedAggregator`!
   *
   * @param kv Deno KV store
   * @param prefix prefix for keys
   * @param info info of feed
   * @param options options
   */
  private constructor(
    kv: KvToolbox,
    prefix: readonly string[],
    info: ICalCalendarData,
    options: Options = {},
  ) {
    const { currentDate } = options;

    this.#kv = kv;
    this.#prefix = prefix;
    this.#info = info;
    this.#currentDate = currentDate;
  }

  /**
   * Create new iCalendar feed Aggregator
   *
   * @param path path for Deno KV store
   * @param prefix prefix for keys
   * @param info info of feed
   * @param options options
   * @returns iCalendar feed Aggregator
   */
  static async create(
    path: string | undefined,
    prefix: readonly string[],
    info: ICalCalendarData,
    options: Options = {},
  ): Promise<CalendarFeedAggregator> {
    const kv = await openKvToolbox({ path });

    const calendarFeedAggregator = new CalendarFeedAggregator(
      kv,
      prefix,
      info,
      options,
    );

    await calendarFeedAggregator.#initialize();

    return calendarFeedAggregator;
  }

  /**
   * Initialize feed aggregator
   */
  async #initialize(): Promise<void> {
    const now = this.#currentDate?.value || new Date();

    await this.#read();

    this.#clean(now);
  }

  /**
   * Validate feed aggregator is initialized
   *
   * @throws {Error} if not initialized
   */
  #checkInitialized(): void {
    if (!this.#initialized) {
      throw new Error(
        `Uninitialized instance. Don't call constructor directly. Instead use factory function 'createICalFeedAggregator'.`,
      );
    }

    return;
  }

  /**
   * Read events from database
   *
   * - beware: might get expired events, run `clean()` before using!
   * - beware: must be called first!
   */
  async #read(): Promise<void> {
    // run only once
    if (this.#initialized) {
      return;
    }

    // beware: not guaranteed to be consistent between batches!
    const entriesIterator = this.#kv.list<CalendarFeedEvent>({
      prefix: this.#prefix,
    }, {
      batchSize: DENO_KV_MAX_BATCH_SIZE,
    });

    for await (const { value } of entriesIterator) {
      const eventId = value.id;

      this.#eventsStored.set(eventId, value);
    }

    this.#initialized = true;
  }

  /**
   * Clean up expired events if any
   *
   * - in case Deno KV hasn't deleted them yet
   * - in case events have expired since created instance or added
   * - beware: must be called first and every time!
   * - note: take `now` as argument to avoid slight time gap
   *
   * @param now current date
   */
  #clean(now: Date): void {
    for (const [id, event] of this.#eventsStored.entries()) {
      if (event.end && event.end <= now) {
        this.#eventsStored.delete(id);
      }
    }
  }

  /**
   * Write events to database
   *
   * - note: take `now` as argument to avoid slight time gap
   *
   * @param eventsPending events to write
   * @param now current date
   */
  async #write(
    eventsPending: CalendarFeedEvent[],
    now: Date,
  ): Promise<void> {
    if (eventsPending.length == 0) {
      return;
    }

    const events = eventsPending
      .map((event) => ({
        key: [...this.#prefix, event.id],
        value: event,
        type: "set" as const,
        expireIn: new Date(event.end ?? event.start).getTime() - now.getTime(),
      }));

    // note: `ok` property of result will always be `true` since transaction lacks `.check()`s
    await this.#kv
      .atomic()
      .mutate(...events)
      .commit();

    const eventsSorted = [...this.#eventsStored.values(), ...eventsPending]
      .sort(this.#sortByKeys.bind(this));

    this.#eventsStored = new Map(
      eventsSorted.map((event) => [event.id, event]),
    );
  }

  /**
   * Sort function for events by lexicographical order of keys
   *
   * @param a first event
   * @param b second event
   * @returns negative number if key of `a` is before `b`, positive number if key of `b` is before `a`, zero if keys are equal
   */
  #sortByKeys(a: CalendarFeedEvent, b: CalendarFeedEvent): number {
    const aKey = [...this.#prefix, a.id];
    const bKey = [...this.#prefix, b.id];

    if (aKey.length != bKey.length) {
      return aKey.length - bKey.length;
    }

    // note: could as well use `bKey.length` since identical
    for (let i = 0; i < aKey.length; i += 1) {
      const keyPartOrdering = aKey[i].localeCompare(bKey[i]);

      if (keyPartOrdering < 0) {
        return -1;
      } else if (keyPartOrdering > 0) {
        return 1;
      }
    }

    return 0;
  }

  /**
   * Get event from feed
   *
   * @param eventId ID of feed event
   * @returns event or undefined if not found
   */
  get(eventId: string): CalendarFeedEvent | undefined {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    this.#clean(now);

    return this.#eventsStored.get(eventId);
  }

  /**
   * Get all events from feed
   *
   * @returns list of events
   */
  getAll(): CalendarFeedEvent[] {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    this.#clean(now);

    return Array.from(
      this.#eventsStored.values(),
    );
  }

  /**
   * Check if event is in feed
   *
   * @param eventId ID of feed event
   * @returns `true` if event is in feed, `false` otherwise
   */
  has(eventId: string): boolean {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    this.#clean(now);

    return this.#eventsStored.has(eventId);
  }

  /**
   * Add events to feed
   *
   * - ignores event if end date is in the past or start date if end date is not set
   * - store events in database
   *
   * @param events events to add
   * @throws {Error} if event with same ID is already in feed
   */
  async add(...events: CalendarFeedEvent[]): Promise<void> {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    this.#clean(now);

    const eventsPending: CalendarFeedEvent[] = [];

    for (const _event of events) {
      // clone to avoid modifying input arguments
      const event = structuredClone(_event);

      if (this.#eventsStored.has(event.id)) {
        throw new Error(`Already added`);
      }

      if (new Date(event.end ?? event.start) <= now) {
        continue;
      }

      eventsPending.push(event);
    }

    await this.#write(eventsPending, now);
  }

  /**
   * Remove event from feed
   *
   * @param eventId ID of feed event
   * @returns `true` if event existed and has been removed, `false` if event doesn't exist
   */
  async remove(eventId: string): Promise<boolean> {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    this.#clean(now);

    const event = this.#eventsStored.get(eventId);

    if (!event) {
      return false;
    }

    const key = [...this.#prefix, event.id];
    await this.#kv.delete(key);

    // note: always `true` since event exists
    return this.#eventsStored.delete(eventId);
  }

  /**
   * Remove all events from feed
   *
   * @returns list of commit results
   */
  removeAll(): Promise<(Deno.KvCommitResult | Deno.KvCommitError)[]> {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    const prefix = [...this.#prefix];

    this.#clean(now);

    let transaction = this.#kv.atomic();

    for (const eventId of this.#eventsStored.keys()) {
      const key = [...prefix, eventId];
      transaction = transaction.mutate({
        key,
        type: "delete",
      });

      this.#eventsStored.delete(eventId);
    }

    return transaction.commit();
  }

  /**
   * Serialize feed
   *
   * @returns string of feed
   */
  toString(): string {
    this.#checkInitialized();

    const now = this.#currentDate?.value || new Date();

    const feed = new ICalCalendar(this.#info);

    this.#clean(now);

    for (const event of this.#eventsStored.values()) {
      feed.createEvent(event);
    }

    return feed.toString();
  }

  /**
   * Dispose feed aggregator
   *
   * - closes database
   */
  [Symbol.dispose](): void {
    this.#checkInitialized();

    this.#kv.close();
  }
}

export const createCalendarFeedAggregator = CalendarFeedAggregator.create;
