// Unused imports are hints!
import { flow } from "fp-ts/lib/function";

test("you can compose functions with flow", () => {
  const addFive = (x) => x + 5;
  const addTen = (x) => x + 10;

  const addFiveAndTen = flow(addFive, addTen);

  expect(addFiveAndTen(10)).toBe(25);
});

test("flow composes functions from left to right", () => {
  const len = (x) => x.length;
  const triple = (x) => x * 3;

  const tripleLength = flow(len, triple);

  expect(tripleLength("aaa")).toBe(9);
});

test("composing incompatible functions can be caught by the compiler if typed!", () => {
  const len = (c: string): number => c.length;
  const triple = (n: number): number => n * 3;

  let tripleLength;
  // Uncomment and check out the type error!
  tripleLength = flow(len, triple);

  expect(tripleLength("aaa")).toBe(9);
});

test("there is no generic curry function which fully preserves types in typescript or fp-ts, use explicit currying instead :(", () => {
  const add = (x: number, y: number): number => x + y;
  let curriedAdd = (x:number) => (y:number) => x + y

  expect(typeof curriedAdd(10)).toBe("function");
  expect(curriedAdd(10)(5)).toBe(15);
});
