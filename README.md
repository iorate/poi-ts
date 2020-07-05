# Poi
Poi is a simple JSON type validator for TypeScript.

```typescript
import * as Poi from 'poi-ts';

const value = JSON.parse('{ "age": 17, "name": "Alice" }');

// The type of 'value' is 'any' here...

Poi.validate(value, Poi.object({ age: Poi.number(), name: Poi.string() }));

// The type of 'value' is '{ age: number; name: string; }' here!!!
```

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Functions](#functions)
  - [Validators](#validators)

## Introduction
We often validate JSON values from network or filesystem.
For example, we can do it with [joi](https://github.com/hapijs/joi):

```javascript
import Joi from '@hapi/joi';

const { error, value } = Joi.object({
  age: Joi.number().required(),
  name: Joi.string().required(),
}).validate(JSON.parse('{ "age": 17, "name": "Alice" }'));
if (!error) {
  // The type of 'value' is '{ age: number; name: string; }' here.

} else {
  console.error(error);
}
```

This is good for JavaScript, but NOT for TypeScript. Although `value` obviously has type `{ age: number; name: string; }` if `!error`, its type on TypeScript is still `any`.

Poi derives the type of `value` automatically.

```typescript
import * as Poi from 'poi-ts';

const value = JSON.parse('{ "age": 17, "name": "Alice" }');

try {
  Poi.validate(value, Poi.object({ age: Poi.number(), name: Poi.string() }));
  // The type of 'value' is '{ age: number; name: string; }' here!!!

  value.age = '37'; // error TS2322: Type '"37"' is not assignable to type 'number'.

} catch (error) {
  console.error(error);
}
```

## Getting Started
Poi can be installed from npm. TypeScript >=3.7.0 is required.

```shell
npm install poi-ts

# or

yarn add poi-ts
```

```typescript
import * as Poi from 'poi-ts';
```

You may need to set `"esInteropModules": true` in `tsconfig.json`.

## Usage
### Functions
#### validate(value, validator, expression?)
`validate(value, validator, expression?)` is [an assertion function](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions) that asserts `value` has the same type as `validator`.

It throws an error of type `ValidationError` if validation fails. The optional parameter `expression` (default: `'value'`) is used for error messages.

```typescript
const value: unknown = [23, 42];

Poi.validate(value, Poi.array(Poi.number()));
// The type of 'value' is 'number[]'.

const tuple = [23, 'str'];
try {
  Poi.validate(value, Poi.array(Poi.number()), 'tuple');
} catch (e) {
  // 'e.message' is:
  //
  // 'tuple' is not of type 'number[]'
  //   'tuple[1]' is not of type 'number'
}
```

#### parseJSON(json, validator, expression?)
`parseJSON(json, validator, expression?)` is a shorthand for `JSON.parse` and `validate`.

```typescript
const value = Poi.parseJSON(
  `{ "foo": 42, "bar": "str" }`,
  Poi.object({ foo: Poi.number(), bar: Poi.string() }),
);
// The type of 'value' is '{ foo: number; bar: string; }'.
```

### Validators
Poi has 9 basic validators.

#### null_()
`null_()` matches only `null`.

```typescript
const value: unknown = null;

Poi.validate(value, Poi.null_());
// The type of 'value' is 'null'.
```

#### boolean()
`boolean()` matches `boolean` values.

```typescript
const value: unknown = true;

Poi.validate(value, Poi.boolean());
// The type of 'value' is 'boolean'.
```

#### number()
`number()` matches `number` values.

```typescript
const value: unknown = 42;

Poi.validate(value, Poi.number());
// The type of 'value' is 'number'.
```

#### string()
`string()` matches `string` values.

```typescript
const value: unknown = 'str';

Poi.validate(value, Poi.string());
// The type of 'value' is 'string'.
```

#### array(elements)
`array(elements)` matches arrays of `elements`.

```typescript
const value: unknown = [23, 42];

Poi.validate(value, Poi.array(Poi.number()));
// The type of 'value' is 'number[]'.
```

#### object(shape)
`object(shape)` matches objects of `shape`.

```typescript
const value: unknown = { foo: 42, bar: 'str' };

Poi.validate(value, Poi.object({ foo: Poi.number(), bar: Poi.string() }));
// The type of 'value' is '{ foo: number; bar: string; }'.
```

Unlike joi, properties are required by default. To make optional properties, use `optional(property)`.

```typescript
const value: unknown = { foo: 42 };

Poi.validate(value, Poi.object({ foo: Poi.number(), bar: Poi.optional(Poi.string())}));
// The type of 'value' is '{ foo: number; bar?: string; }'.
```

Unknown properties are always ignored.

```typescript
const value: unknown = { foo: 42, bar: 'str', baz: true };

Poi.validate(value, Poi.object({ foo: Poi.number(), bar: Poi.string() }));
// The type of 'value' is '{ foo: number; bar: string; }'.
```

#### literal(lit)
`literal(lit)` matches values equal to `lit`. `lit` shall be a literal.

```typescript
const value: unknown = 42;

Poi.validate(value, Poi.literal(42));
// The type of 'value' is '42'.
```

#### tuple(elements)
`tuple(elements)` matches tuples of `elements`.

```typescript
const value: unknown = [42, 'str'];

Poi.validate(value, Poi.tuple(Poi.number(), Poi.string()));
// The type of 'value' is '[number, string]'.
```

NOTE: Optional elements and rest elements (e.g. `[boolean, number?, ...string[]]`) are not yet supported.

#### union(alternatives)
`union(alternatives)` matches one of `alternatives`.

```typescript
const value: unknown = 42;

Poi.validate(value, Poi.union(Poi.boolean(), Poi.number(), Poi.string()));
// The type of 'value' is 'boolean | number | string'.
```

## Author
[iorate](https://github.com/iorate) ([Twitter](https://twitter.com/iorate))

## License
[MIT License](LICENSE.txt)
