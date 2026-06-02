import { describe, expect, it } from "vitest";

import { scorePassword } from "./utils";

describe("scorePassword", () => {
  it("scores an empty password as the weakest", () => {
    expect(scorePassword("")).toEqual({ score: 0, label: "Juda zaif" });
  });

  it("gives a mid score to an 8-char mixed-case password with a digit", () => {
    // length>=8 (+1), lower+upper (+1), digit (+1) => 3
    expect(scorePassword("Abcdef12")).toEqual({ score: 3, label: "Yaxshi" });
  });

  it("clamps a very strong password to 4", () => {
    expect(scorePassword("Abcdefgh1234!")).toEqual({ score: 4, label: "Kuchli" });
  });
});
