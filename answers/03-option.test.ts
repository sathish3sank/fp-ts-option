import { flow } from "fp-ts/lib/function";
import { lookup } from "fp-ts/lib/ReadonlyRecord";
import { pipe } from "fp-ts/lib/pipeable";

import * as Option from "fp-ts/lib/Option";

test("An Option is either something or nothing!", () => {
  const something = Option.some("thing");
  const nothing = Option.none;

  const operateOnAnOption = (x: Option.Option<string>) => {
    if (Option.isNone(x)) {
      return "The Option was empty...";
    } else {
      return `Found '${x.value}' inside the option!`;
    }
  };

  expect(operateOnAnOption(something)).toBe("Found 'thing' inside the option!");
  expect(operateOnAnOption(nothing)).toBe("The Option was empty...");
});

test("Instead of unwrapping the Option to work on the value, use Option.map to apply a function if there is something!", () => {
  const something = Option.some("boo");
  const upperCase = Option.map((x: string): string => x.toUpperCase());

  expect(upperCase(something)).toStrictEqual(Option.some("BOO"));
  expect(upperCase(Option.none)).toStrictEqual(Option.none); // If there is nothing you'll get back nothing!
});

test("You can get an safer Option from a dangerous nullable", () => {
  expect(Option.fromNullable(null)).toStrictEqual(Option.none);
  expect(Option.fromNullable(undefined)).toStrictEqual(Option.none);
  expect(Option.fromNullable("thing")).toStrictEqual(Option.some("thing"));
});

test("Or use a predicate to wrap a value in an Option", () => {
  const validator = Option.fromPredicate((x: string) => x.length > 3);
  expect(validator("valid")).toStrictEqual(Option.some("valid"));
  expect(validator("err")).toStrictEqual(Option.none);
});

test("Functions throwing exceptions can also be transformed to easier to deal with Options", () => {
  const throwIfInvalid = (s: string) => {
    if (s.length <= 3) {
      throw new Error("Error!");
    } else {
      return s;
    }
  };
  expect(Option.tryCatch(() => throwIfInvalid("valid"))).toStrictEqual(
    Option.some("valid")
  );
  expect(Option.tryCatch(() => throwIfInvalid("err"))).toStrictEqual(
    Option.none
  );
});

test("Refactor and fix this unsafe and buggy code with Options and pipes!", () => {
  const trace = (tag) => (x) => {
    console.log(tag, x);
    return x;
  };
  const dodgyUserApi = {
    charlie: "{ posts : 20 }",
    stephen: `{ "posts" : 0 }`,
  };
  const optionParseJson = (json: string): Option.Option<any> =>
    Option.tryCatch(() => JSON.parse(json));
  const getNumberOfUsersPosts = (username: string) =>
    pipe(
      lookup(username, dodgyUserApi),
      Option.map(optionParseJson),
      Option.map(Option.map((userData: any) => lookup("posts", userData)))
    );
  const displayNumberOfUsersPosts = (username: string) =>
    pipe(
      getNumberOfUsersPosts(username),
      Option.map(
        Option.map(Option.map((posts) => `${username} has ${posts} posts`))
      ),
      Option.flatten,
      Option.flatten,
      Option.getOrElse(() => `Error getting number of user ${username}'s posts`)
    );

  expect(displayNumberOfUsersPosts("stephen")).toBe("stephen has 0 posts");
  expect(displayNumberOfUsersPosts("unknown")).toBe(
    "Error getting number of user unknown's posts"
  );
  expect(displayNumberOfUsersPosts("charlie")).toBe(
    "Error getting number of user charlie's posts"
  );
});
