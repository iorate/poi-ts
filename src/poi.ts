const IDENTIFIER_REGEX = /^[$A-Za-z_]([$0-9A-Za-z_]*)$/;

export class ValidationError extends Error {
  constructor(
    readonly expression: string,
    readonly expectedType: string,
    readonly subErrors: readonly ValidationError[] = [],
  ) {
    super(
      [
        `'${expression}' is not of type '${expectedType}'`,
        ...subErrors.map(subError =>
          subError.message
            .split('\n')
            .map(line => `  ${line}`)
            .join('\n'),
        ),
      ].join('\n'),
    );
    this.name = 'ValidationError';
  }
}

interface ValidatorBase {
  readonly _typeKind?: string;
  readonly _typeName: string;
  _validate(value: unknown, expression: string): void | ValidationError;
}

export interface Validator<T, TK extends string = string> extends ValidatorBase {
  readonly _type?: T;
  readonly _typeKind?: TK;
  _validate(value: unknown, expression: string): void | ValidationError;
}

export type ValidatorType<V> = V extends { readonly _type?: infer T } ? T : never;

export function null_(): Validator<null> {
  return {
    _typeName: 'null',
    _validate(value, expression) {
      if (value !== null) {
        return new ValidationError(expression, this._typeName);
      }
    },
  };
}

export function boolean(): Validator<boolean> {
  return {
    _typeName: 'boolean',
    _validate(value, expression) {
      if (typeof value !== 'boolean') {
        return new ValidationError(expression, this._typeName);
      }
    },
  };
}

export function number(): Validator<number> {
  return {
    _typeName: 'number',
    _validate(value, expression) {
      if (typeof value !== 'number') {
        return new ValidationError(expression, this._typeName);
      }
    },
  };
}

export function string(): Validator<string> {
  return {
    _typeName: 'string',
    _validate(value, expression) {
      if (typeof value !== 'string') {
        return new ValidationError(expression, this._typeName);
      }
    },
  };
}

export function array<V extends ValidatorBase>(validator: V): Validator<ValidatorType<V>[]> {
  return {
    _typeName:
      validator._typeKind === 'u' ? `(${validator._typeName})[]` : `${validator._typeName}[]`,
    _validate(value, expression) {
      if (!Array.isArray(value)) {
        return new ValidationError(expression, this._typeName);
      }
      let index = 0;
      for (const element of value) {
        const subError = validator._validate(element, `${expression}[${index}]`);
        if (subError) {
          return new ValidationError(expression, this._typeName, [subError]);
        }
        ++index;
      }
    },
  };
}

export function tuple<Validators extends readonly ValidatorBase[]>(
  ...validators: readonly [...Validators]
): Validator<{ [I in keyof Validators]: ValidatorType<Validators[I]> }> {
  return {
    _typeName: `[${validators.map(validator => validator._typeName).join(', ')}]`,
    _validate(value, expression) {
      if (!Array.isArray(value) || value.length !== validators.length) {
        return new ValidationError(expression, this._typeName);
      }
      let index = 0;
      for (const validator of validators) {
        const subError = validator._validate(value[index], `${expression}[${index}]`);
        if (subError) {
          return new ValidationError(expression, this._typeName, [subError]);
        }
        ++index;
      }
    },
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && !Array.isArray(value) && typeof value === 'object';
}

export function object<VM extends Readonly<Record<string, ValidatorBase>>>(
  validatorMap: VM,
): Validator<
  {
    [K in keyof VM]: VM[K]['_typeKind'] extends 'o' | undefined
      ? { [K0 in K]?: ValidatorType<VM[K0]> }
      : { [K0 in K]: ValidatorType<VM[K0]> };
  }[keyof VM] extends infer U
    ? (U extends unknown ? (u: U) => void : never) extends (i: infer I) => void
      ? { [K in keyof I]: I[K] }
      : never
    : never
> {
  const validatorMapEntries = Object.entries(validatorMap);
  return {
    _typeName: validatorMapEntries.length
      ? `{ ${validatorMapEntries
          .map(
            ([key, validator]) =>
              `${IDENTIFIER_REGEX.test(key) ? key : JSON.stringify(key)}${
                validator._typeKind === 'o' ? '?' : ''
              }: ${validator._typeName};`,
          )
          .join(' ')} }`
      : '{}',
    _validate(value, expression) {
      if (!isObject(value)) {
        return new ValidationError(expression, this._typeName);
      }
      for (const [key, validator] of validatorMapEntries) {
        const subError = validator._validate(
          value[key],
          IDENTIFIER_REGEX.test(key)
            ? `${expression}.${key}`
            : `${expression}[${JSON.stringify(key)}]`,
        );
        if (subError) {
          return new ValidationError(expression, this._typeName, [subError]);
        }
      }
    },
  };
}

export function optional<V extends ValidatorBase>(validator: V): Validator<ValidatorType<V>, 'o'> {
  return {
    _typeKind: 'o',
    _typeName: validator._typeName,
    _validate(value, expression) {
      if (value === undefined) {
        return;
      }
      return validator._validate(value, expression);
    },
  };
}

export function record<V extends ValidatorBase>(
  validator: V,
): Validator<Record<string, ValidatorType<V>>> {
  return {
    _typeName: `{ [key: string]: ${validator._typeName}; }`,
    _validate(value, expression) {
      if (!isObject(value)) {
        return new ValidationError(expression, this._typeName);
      }
      for (const key of Object.keys(value)) {
        const subError = validator._validate(value[key], `${expression}[${JSON.stringify(key)}]`);
        if (subError) {
          return new ValidationError(expression, this._typeName, [subError]);
        }
      }
    },
  };
}

export function literal<L extends boolean | number | string>(l: L): Validator<L> {
  return {
    _typeName: JSON.stringify(l),
    _validate(value, expression) {
      if (value !== l) {
        return new ValidationError(expression, this._typeName);
      }
    },
  };
}

export function union<Validators extends readonly ValidatorBase[]>(
  ...validators: readonly [...Validators]
): Validator<Validators[number] extends infer Validator ? ValidatorType<Validator> : never, 'u'> {
  return {
    _typeKind: 'u',
    _typeName: validators.map(validator => validator._typeName).join(' | '),
    _validate(value, expression) {
      const subErrors: ValidationError[] = [];
      for (const validator of validators) {
        const subError = validator._validate(value, expression);
        if (!subError) {
          return;
        }
        subErrors.push(subError);
      }
      return new ValidationError(expression, this._typeName, subErrors);
    },
  };
}

export function unknown(): Validator<unknown> {
  return {
    _typeName: 'unknown',
    _validate() {}, // eslint-disable-line @typescript-eslint/no-empty-function
  };
}

export function validate<T>(
  value: unknown,
  validator: Validator<T>,
  expression = 'value',
): asserts value is T {
  const error = validator._validate(value, expression);
  if (error) {
    throw error;
  }
}

export function tryValidate<T>(value: unknown, validator: Validator<T>): value is T {
  return !validator._validate(value, '');
}

export function parseJSON<T>(json: string, validator: Validator<T>, expression = 'value'): T {
  const value = JSON.parse(json) as unknown;
  validate(value, validator, expression);
  return value;
}

export function tryParseJSON<T>(json: string, validator: Validator<T>): T | undefined {
  try {
    const value = JSON.parse(json) as unknown;
    if (tryValidate(value, validator)) {
      return value;
    }
  } catch {} // eslint-disable-line no-empty
}
