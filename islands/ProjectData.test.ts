import {
  cleanup,
  render,
  setup,
  userEvent,
} from "$fresh-testing-library/components.ts";
import { expect } from "$fresh-testing-library/expect.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";

import { default as manifest } from "./demo/fresh.gen.ts";

import { expect, fn } from "$fresh-testing-library/expect.ts";

describe("islands/ProjectData.tsx", () => {
  beforeAll(() => setup({ manifest }));
  afterEach(cleanup);
});

Deno.test("expect", () => {
  expect(1).toBe(1);

  const spy = fn();
  expect(spy).not.toBeCalled();
  spy();
  expect(spy).toBeCalled();

  // Matchers provided by `@testing-library/jest-dom` are also supported.
  expect(expect(null).toBeInTheDocument).toBeTruthy();
});