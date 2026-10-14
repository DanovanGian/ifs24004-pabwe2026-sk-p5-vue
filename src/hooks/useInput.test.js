import { describe, expect, it } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("memakai string kosong sebagai nilai awal bawaan", () => {
    const [value] = useInput();
    expect(value.value).toBe("");
  });

  it("memakai nilai awal yang diberikan", () => {
    const [value] = useInput("halo");
    expect(value.value).toBe("halo");
  });

  it("onChange mengisi nilai dari event.target.value", () => {
    const [value, onChange] = useInput("halo");
    onChange({ target: { value: "dunia" } });
    expect(value.value).toBe("dunia");
  });

  it("reset mengembalikan nilai ke awal", () => {
    const [value, onChange, reset] = useInput("halo");
    onChange({ target: { value: "dunia" } });
    reset();
    expect(value.value).toBe("halo");
  });
});
