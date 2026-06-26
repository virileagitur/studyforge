import { describe, it, expect } from "vitest";
import { calc } from "./utils";

describe("calc", () => {
  it("adds two numbers", () => {
    expect(calc(2, 3, "add")).toBe(5);
  });

  it("subtracts two numbers", () => {
    expect(calc(5, 3, "subtract")).toBe(2);
  });

  it("multiplies two numbers", () => {
    expect(calc(4, 5, "multiply")).toBe(20);
  });

  it("divides two numbers", () => {
    expect(calc(10, 2, "divide")).toBe(5);
  });

  it("throws on division by zero", () => {
    expect(() => calc(5, 0, "divide")).toThrow("Division by zero is not allowed");
  });

  it("throws on unknown operation", () => {
    expect(() => calc(1, 2, "power" as any)).toThrow("Unknown operation: power");
  });
});
