export function calc(a: number, b: number, operation: "add" | "subtract" | "multiply" | "divide"): number {
  switch (operation) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      if (b === 0) {
        throw new Error("Division by zero is not allowed");
      }
      return a / b;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
