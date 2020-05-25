import * as Option from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { lookup } from "fp-ts/lib/ReadonlyRecord";

test("An Option is either something or nothing!", () => {
  const something: Option.Option<string> = Option.some("boo");
  const nothing: Option.Option<string> = Option.none;

  const upperCase = (x: Option.Option<string>) => {
    if (Option.isNone(x)) {
      return "Nothing";
    }
    return x.value.toUpperCase();
  };

  expect(upperCase(something)).toBe("BOO");
  expect(upperCase(nothing)).toBe("Nothing");
});

test("Instead of unwrapping the Option to work on the value, use Option.map to apply a function if there is something!", () => {
  const something = Option.some("boo");
  const upperCase = Option.map((x: string) => x.toUpperCase()); // Implement me!

  expect(upperCase(something)).toStrictEqual(Option.some("BOO"));
  expect(upperCase(Option.none)).toStrictEqual(Option.none); // If there is nothing you'll get back nothing!
});

test("You can get an safer Option from a dangerous nullable", () => {
  // Fill in the assertions!
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

test("Options make working nullables much safer by forcing you to handle the none case", () => {
  const aDangerousLookupFunction = (k: string) => (data: object) => data[k];
  const welcomeUser = (x: string) => (x ? `Welcome ${x}!` : "Error!");

  const registerUser = (data) =>
    pipe(data, aDangerousLookupFunction("username"), welcomeUser);

  expect(registerUser({ username: "Charles" })).toBe("Welcome Charles!");
  expect(registerUser({})).toBe("Error!");
});

test("Refactor and fix this unsafe and buggy code with Options and pipes!", () => {
  const dodgyUserApi = {
    charlie: "{ posts: 20 }",
    stephen: "{ posts: 0 }",
  };

  const Rview = (key, object): Option.Option<string> => lookup(key, object);

  const optionParseJson = (json: string): Option.Option<any> => {
    return Option.tryCatch(() => JSON.parse(JSON.stringify(json)));
  };

  const getNumberOfUsersPosts = (username: string) =>
    pipe(
      Rview(username, dodgyUserApi),
      Option.map(optionParseJson),
      // Option.map((x) => Rview("posts", x))
      Option.flatten
    );

  const displayNumberOfUsersPosts = (username: string) =>
    pipe(
      username,
      getNumberOfUsersPosts,
      Option.map((post) => `${username} has ${post} posts`),
      Option.getOrElse(() => `Error getting number of user ${username}'s posts`)
    );

  // Fix the bug exposed by this failing test
  expect(displayNumberOfUsersPosts("stephen")).toBe("stephen has 0 posts");

  expect(displayNumberOfUsersPosts("unknown")).toBe(
    "Error getting number of user unknown's posts"
  );
  expect(displayNumberOfUsersPosts("charlies")).toBe(
    "Error getting number of user charlies's posts"
  );
});
