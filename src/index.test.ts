import * as Poi from '.';

test('null_() matches only null', () => {
  let value: unknown = null;
  Poi.validate(value, Poi.null_());
  const value2: null = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  value = true;
  expect(() => Poi.validate(value, Poi.null_())).toThrow(
    new Error(`'value' is not of type 'null'`),
  );
});

test('boolean() matches a boolean value', () => {
  let value: unknown = true;
  Poi.validate(value, Poi.boolean());
  const value2: boolean = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  value = 42;
  expect(() => Poi.validate(value, Poi.boolean())).toThrow(
    new Error(`'value' is not of type 'boolean'`),
  );
});

test('number() matches a number value', () => {
  let value: unknown = 42;
  Poi.validate(value, Poi.number());
  const value2: number = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  value = 'str';
  expect(() => Poi.validate(value, Poi.number())).toThrow(
    new Error(`'value' is not of type 'number'`),
  );
});

test('string() matches a string value', () => {
  let value: unknown = 'str';
  Poi.validate(value, Poi.string());
  const value2: string = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  value = [23, 42];
  expect(() => Poi.validate(value, Poi.string())).toThrow(
    new Error(`'value' is not of type 'string'`),
  );
});

test('array(element) matches an array of element', () => {
  let value: unknown = [23, 42];
  Poi.validate(value, Poi.array(Poi.number()));
  const value2: number[] = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  value = [23, 'str'];
  expect(() => Poi.validate(value, Poi.array(Poi.number()))).toThrow(
    new Error(`'value' is not of type 'number[]'
  'value[1]' is not of type 'number'`),
  );
  value = { 0: 23, 1: 42 };
  expect(() => Poi.validate(value, Poi.array(Poi.number()))).toThrow(
    new Error(`'value' is not of type 'number[]'`),
  );

  value = [];
  Poi.validate(value, Poi.array(Poi.number()));
  const value3: number[] = value; // eslint-disable-line @typescript-eslint/no-unused-vars
});

test('object(shape) matches an object of shape', () => {
  let value: unknown = { foo: 42, bar: 'str' };
  Poi.validate(value, Poi.object({ foo: Poi.number(), bar: Poi.optional(Poi.string()) }));
  const value2: { foo: number; bar?: string } = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  value = { foo: '42', bar: 'str' };
  expect(() =>
    Poi.validate(value, Poi.object({ foo: Poi.number(), bar: Poi.optional(Poi.string()) })),
  ).toThrow(
    new Error(`'value' is not of type '{ foo: number; bar?: string; }'
  'value.foo' is not of type 'number'`),
  );
  value = { foo: 42, bar: true };
  expect(() =>
    Poi.validate(value, Poi.object({ foo: Poi.number(), bar: Poi.optional(Poi.string()) })),
  ).toThrow(
    new Error(`'value' is not of type '{ foo: number; bar?: string; }'
  'value.bar' is not of type 'string'`),
  );

  value = {};
  Poi.validate(value, Poi.object({}));

  value = { '.foo': 23, bar: 42 };
  Poi.validate(value, Poi.object({ '.foo': Poi.optional(Poi.number()) }));
  const value3: { '.foo'?: number } = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  value = { '.foo': 'str', bar: 42 };
  expect(() => Poi.validate(value, Poi.object({ '.foo': Poi.optional(Poi.number()) }))).toThrow(
    new Error(`'value' is not of type '{ ".foo"?: number; }'
  'value[".foo"]' is not of type 'number'`),
  );
});

test('literal(lit) matches a value equal to lit', () => {
  let value: unknown = true;
  Poi.validate(value, Poi.literal(true));
  const value2: true = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  value = false;
  expect(() => Poi.validate(value, Poi.literal(true))).toThrow(
    new Error(`'value' is not of type 'true'`),
  );
  value = [42, 'str'];
  expect(() => Poi.validate(value, Poi.literal(true))).toThrow(
    new Error(`'value' is not of type 'true'`),
  );

  value = 42;
  Poi.validate(value, Poi.literal(42));
  const value3: 42 = value; // eslint-disable-line @typescript-eslint/no-unused-vars

  value = 'str';
  Poi.validate(value, Poi.literal('str'));
  const value4: 'str' = value; // eslint-disable-line @typescript-eslint/no-unused-vars
});

test('tuple(...elements) matches a tuple of elements', () => {
  let value: unknown = [42, 'str'];
  Poi.validate(value, Poi.tuple(Poi.number(), Poi.string()));
  const value2: [number, string] = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  value = [42, null];
  expect(() => Poi.validate(value, Poi.tuple(Poi.number(), Poi.string()))).toThrow(
    new Error(`'value' is not of type '[number, string]'
  'value[1]' is not of type 'string'`),
  );
  value = [42, null, true];
  expect(() => Poi.validate(value, Poi.tuple(Poi.number(), Poi.string()))).toThrow(
    new Error(`'value' is not of type '[number, string]'`),
  );
  value = 42;
  expect(() => Poi.validate(value, Poi.tuple(Poi.number(), Poi.string()))).toThrow(
    new Error(`'value' is not of type '[number, string]'`),
  );

  value = [];
  Poi.validate(value, Poi.tuple());
  const value3: [] = value; // eslint-disable-line @typescript-eslint/no-unused-vars
});

test('union(...alternatives) matches one of alternatives', () => {
  let value: unknown = 'str';
  Poi.validate(value, Poi.union(Poi.number(), Poi.string()));
  const value2: number | string = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  value = null;
  expect(() => Poi.validate(value, Poi.union(Poi.number(), Poi.string()))).toThrow(
    new Error(`'value' is not of type 'number | string'
  'value' is not of type 'number'
  'value' is not of type 'string'`),
  );
});

test('unknown() matches any', () => {
  const value: unknown = { foo: 42, bar: 'str' };
  Poi.validate(value, Poi.object({ foo: Poi.unknown(), bar: Poi.unknown() }));
  const value2: { foo: unknown; bar: unknown } = value; // eslint-disable-line @typescript-eslint/no-unused-vars
});

test('Nested validator works well', () => {
  let value: unknown = { code: 42, details: { type: 'b', values: ['foo', 'bar'] } };
  const validator = Poi.object({
    code: Poi.number(),
    description: Poi.optional(Poi.string()),
    details: Poi.union(
      Poi.object({ type: Poi.literal('a') }),
      Poi.object({ type: Poi.literal('b'), values: Poi.array(Poi.string()) }),
    ),
  });
  Poi.validate(value, validator);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const value2: {
    code: number;
    description?: string;
    details: { type: 'a' } | { type: 'b'; values: string[] };
  } = value;
  value = { code: 23, details: { type: 'b', values: [null, 'bar'] } };
  expect(() => Poi.validate(value, validator)).toThrow(
    new Error(`'value' is not of type '{ code: number; description?: string; details: { type: "a"; } | { type: "b"; values: string[]; }; }'
  'value.details' is not of type '{ type: "a"; } | { type: "b"; values: string[]; }'
    'value.details' is not of type '{ type: "a"; }'
      'value.details.type' is not of type '"a"'
    'value.details' is not of type '{ type: "b"; values: string[]; }'
      'value.details.values' is not of type 'string[]'
        'value.details.values[0]' is not of type 'string'`),
  );
});

test('validate(value, validator, expression?) asserts value has the same type as validator', () => {
  let value: unknown = { foo: 42, bar: 'str' };
  Poi.validate(value, Poi.object({ foo: Poi.number(), bar: Poi.string() }));
  const value2: { foo: number; bar: string } = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  value = { foo: '42', bar: 'str' };
  expect(() =>
    Poi.validate(
      value,
      Poi.object({ foo: Poi.number(), bar: Poi.string() }),
      JSON.stringify(value),
    ),
  ).toThrow(
    new Error(`'{"foo":"42","bar":"str"}' is not of type '{ foo: number; bar: string; }'
  '{"foo":"42","bar":"str"}.foo' is not of type 'number'`),
  );
});

test('tryValidate(value, validator) returns whether value has the same type as validator', () => {
  const value: unknown = { foo: 42, bar: 'str' };
  if (Poi.tryValidate(value, Poi.object({ foo: Poi.number(), bar: Poi.number() }))) {
    throw new Error('Never reached');
  } else if (Poi.tryValidate(value, Poi.object({ foo: Poi.number(), bar: Poi.string() }))) {
    const value2: { foo: number; bar: string } = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  } else {
    throw new Error('Never reached');
  }
});

test('parseJSON(json, validator, expression?) is a shorthand for JSON.parse and validate', () => {
  const value = Poi.parseJSON(
    `{ "foo": 42, "bar": "str" }`,
    Poi.object({ foo: Poi.number(), bar: Poi.string() }),
  );
  const value2: { foo: number; bar: string } = value; // eslint-disable-line @typescript-eslint/no-unused-vars
  expect(value).toEqual({ foo: 42, bar: 'str' });
  const json = `{ "foo": "42", "bar": "str" }`;
  expect(() =>
    Poi.parseJSON(json, Poi.object({ foo: Poi.number(), bar: Poi.string() }), json),
  ).toThrow(
    new Error(`'{ "foo": "42", "bar": "str" }' is not of type '{ foo: number; bar: string; }'
  '{ "foo": "42", "bar": "str" }.foo' is not of type 'number'`),
  );
  expect(() =>
    Poi.parseJSON(`{ foo: 42, bar: 'str' }`, Poi.object({ foo: Poi.number(), bar: Poi.string() })),
  ).toThrow();
});

test('tryParseJSON(json, validator) is a shorthand for JSON.parse and validate', () => {
  const value1 = Poi.tryParseJSON(
    `{ "foo": 42, "bar": "str" }`,
    Poi.object({ foo: Poi.number(), bar: Poi.string() }),
  );
  const value2: { foo: number; bar: string } | undefined = value1; // eslint-disable-line @typescript-eslint/no-unused-vars
  expect(value1).toEqual({ foo: 42, bar: 'str' });

  const json = `{ "foo": "42", "bar": "str" }`;
  const value3 = Poi.tryParseJSON(json, Poi.object({ foo: Poi.number(), bar: Poi.string() }));
  const value4: { foo: number; bar: string } | undefined = value3; // eslint-disable-line @typescript-eslint/no-unused-vars
  expect(value3).toEqual(undefined);

  const value5 = Poi.tryParseJSON(
    `{ foo: 42, bar: 'str' }`,
    Poi.object({ foo: Poi.number(), bar: Poi.string() }),
  );
  const value6: { foo: number; bar: string } | undefined = value5; // eslint-disable-line @typescript-eslint/no-unused-vars
  expect(value5).toEqual(undefined);
});
