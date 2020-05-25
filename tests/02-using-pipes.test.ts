import { pipe } from "fp-ts/lib/pipeable";
import { flow } from "fp-ts/lib/function";

test("pipe sends the first argument through the following pipeline of functions!", () => {
  const multiplyBy = (x: number) => (y: number) => x * y;
  const add = (x: number) => (y: number) => x + y;

  // Pipe is preferred over flow in fp-ts, implement usingPipe and see if you can tell why
  const usingPipe = (x: number) =>
    pipe(x, multiplyBy(10), (y: number) => add(5)(y));
  const usingFlow = (x: number) => flow(multiplyBy(10), add(5))(x);

  expect(usingPipe(2)).toBe(usingFlow(2));
});

test("Debug what is going on inside your pipes using a handy trace function", () => {
  const trace = (tag: string) => (x: any) => {
    console.log(tag, x);
    return x;
  };

  const pipeTest = (x: number) =>
    pipe(
      x,
      (x) => x + 20,
      trace("after addition:"),
      (x) => x + " is a big number",
      trace("after becoming a string:")
    );

  expect(pipeTest(7)).toBe("27 is a big number");
});

// TODO When do we need to use the pipeable function? What is it for?
