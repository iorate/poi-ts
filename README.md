# Poi
Poi is a simple JSON type validator for TypeScript.

```typescript
import * as Poi from 'poi-ts';

const json = '{ "age": 17, "name": "Alice" }';

const value = JSON.parse(json);
// The type of 'value' is 'any' here...

try {
  Poi.validate(value, Poi.object({ age: Poi.number(), name: Poi.string() }));
  // The type of 'value' is '{ age: number; name: string; }' here!!!

} catch (error) {
  // Validation error

}
```

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Functions](#functions)
  - [Validators](#validators)

## Introduction
We often validate types of JSON values fetched from network or filesystem.
For example, we can do it with [joi](https://github.com/hapijs/joi):

```javascript
import Joi from '@hapi/joi';

const json = '{ "age": 17, "name": "Alice" }';

const { error, value } = Joi.object({
  age: Joi.number().required(),
  name: Joi.string().required(),
}).validate(JSON.parse(json));

if (!error) {
  // The type of 'value' is 'any' here...

} else {
  // Validation error

}
```

This is good for JavaScript, but not for TypeScript. Although `value` obviously has type `{ age: number; name: string; }` if `!error`, its type in TypeScript is still `any`.

```typescript
  // The type of 'value' is 'any' here...
  
  value.age = '37';         // type mismatch, but no compile error
  console.log(value.namae); // typo, but no compile error
```

Poi derives the type of `value` automatically.

```typescript
import * as Poi from 'poi-ts';

const json = '{ "age": 17, "name": "Alice" }';

const value = JSON.parse(json);

try {
  Poi.validate(value, Poi.object({ age: Poi.number(), name: Poi.string() }));
  // The type of 'value' is '{ age: number; name: string; }' here!!!

  value.age = '37';         // error TS2322: Type '"37"' is not assignable to type 'number'.
  console.log(value.namae); // error TS2551: Property 'namae' does not exist on type
                            // '{ age: number; name: string; }'. Did you mean 'name'?

} catch (error) {
  // Validation error

}
```

## Getting Started
Poi can be installed from npm. `typescript >=3.7.2` is required to use Poi in TypeScript.

```shell
npm install poi-ts

# or

yarn add poi-ts
```

```typescript
import * as Poi from 'poi-ts';
```

## Usage
### Functions
#### validate(value, validator, expression?)
`validate(value, validator, expression?)` is [an assertion function](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions) that asserts `value` has the same type as `validator`.

It throws an error of type `ValidationError` if validation fails. The optional parameter `expression` (default: `'value'`) is used for error messages.

```typescript
const value: unknown = [23, 42];

Poi.validate(value, Poi.array(Poi.number()));
// The type of 'value' is 'number[]'.

const tuple: unknown = [23, 'str'];
try {
  Poi.validate(tuple, Poi.array(Poi.number()), 'tuple');
} catch (error) {
  console.error(error.message); // 'tuple' is not of type 'number[]'
                                //   'tuple[1]' is not of type 'number'
}
```

#### parseJSON(json, validator, expression?)
`parseJSON(json, validator, expression?)` is a shorthand for `JSON.parse(json)` and `validate(value, validator, expression?)`.

```typescript
const value = Poi.parseJSON(
  '{ "foo": 42, "bar": "str" }',
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
`boolean()` matches a `boolean` value.

```typescript
const value: unknown = true;

Poi.validate(value, Poi.boolean());
// The type of 'value' is 'boolean'.
```

#### number()
`number()` matches a `number` value.

```typescript
const value: unknown = 42;

Poi.validate(value, Poi.number());
// The type of 'value' is 'number'.
```

#### string()
`string()` matches a `string` value.

```typescript
const value: unknown = 'str';

Poi.validate(value, Poi.string());
// The type of 'value' is 'string'.
```

#### array(element)
`array(element)` matches an array of `element`.

```typescript
const value: unknown = [23, 42];

Poi.validate(value, Poi.array(Poi.number()));
// The type of 'value' is 'number[]'.
```

#### object(shape)
`object(shape)` matches an object of `shape`.

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
`literal(lit)` matches a value equal to `lit`. `lit` shall be a literal.

```typescript
const value: unknown = 42;

Poi.validate(value, Poi.literal(42));
// The type of 'value' is '42'.
```

#### tuple(...elements)
`tuple(...elements)` matches a tuple of `elements`.

```typescript
const value: unknown = [42, 'str'];

Poi.validate(value, Poi.tuple(Poi.number(), Poi.string()));
// The type of 'value' is '[number, string]'.
```

NOTE: Optional elements and rest elements (e.g. `[boolean, number?, ...string[]]`) are not yet supported.

#### union(...alternatives)
`union(...alternatives)` matches one of `alternatives`.

```typescript
const value: unknown = 42;

Poi.validate(value, Poi.union(Poi.boolean(), Poi.number(), Poi.string()));
// The type of 'value' is 'boolean | number | string'.
```

## Author
[iorate](https://github.com/iorate) ([Twitter](https://twitter.com/iorate))

## License
[MIT License](LICENSE.txt)
