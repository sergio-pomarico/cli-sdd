import { describe, expect, it } from "vitest";

import { assertStatusTransition } from "../../src/utils/transitions.js";
import type { TaskStatus } from "../../src/utils/validation.js";

const statuses: TaskStatus[] = ["todo", "in-progress", "done"];
const allowed = new Set([
  "todo:in-progress",
  "in-progress:done",
  "in-progress:todo",
  "done:todo",
]);

describe("assertStatusTransition", () => {
  for (const current of statuses) {
    for (const requested of statuses) {
      const key = `${current}:${requested}`;

      if (allowed.has(key)) {
        it(`allows ${current} -> ${requested}`, () => {
          expect(() => assertStatusTransition(current, requested)).not.toThrow();
        });
      } else if (current === requested) {
        it(`rejects the ${current} same-state transition`, () => {
          expect(() => assertStatusTransition(current, requested)).toThrow(
            new RegExp(`already ${current}`),
          );
        });
      } else if (current === "todo" && requested === "done") {
        it("explains that todo -> done must pass through in-progress", () => {
          expect(() => assertStatusTransition(current, requested)).toThrow(/in-progress first/i);
        });
      } else {
        it(`rejects ${current} -> ${requested}`, () => {
          expect(() => assertStatusTransition(current, requested)).toThrow(/cannot move/i);
        });
      }
    }
  }
});
