const IDENTIFIER_REGEX = /^[$A-Za-z_]([$0-9A-Za-z_]*)$/;

export class ValidationError extends Error {
  constructor(
    readonly expression: string,
    readonly expectedType: string,
    readonly subErrors: ValidationError[] = [],
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

export interface ValidatorBase {
  _typeKind?: string;
  _typeName: string;
  _validate(value: unknown, expression: string): ValidationError | null;
}

export interface Validator<T, TK extends string = string> extends ValidatorBase {
  _type?: T;
  _typeKind?: TK;
  _validate(value: unknown, expression: string): ValidationError | null;
}

export type ValidatorType<V> = V extends { _type?: infer T } ? T : never;

export function null_(): Validator<null> {
  return {
    _typeName: 'null',
    _validate(value, expression) {
      if (value !== null) {
        return new ValidationError(expression, this._typeName);
      }
      return null;
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
      return null;
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
      return null;
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
      return null;
    },
  };
}

export function array<V extends ValidatorBase>(validator: V): Validator<ValidatorType<V>[]> {
  return {
    _typeName:
      validator._typeKind === 'union' ? `(${validator._typeName})[]` : `${validator._typeName}[]`,
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
      return null;
    },
  };
}

export function optional<V extends ValidatorBase>(
  validator: V,
): Validator<ValidatorType<V>, 'optional'> {
  return {
    _typeKind: 'optional',
    _typeName: validator._typeName,
    _validate(value, expression) {
      if (value === undefined) {
        return null;
      }
      return validator._validate(value, expression);
    },
  };
}

export function object<VM extends Record<string, ValidatorBase>>(
  validatorMap: VM,
): Validator<
  {
    [K in keyof VM]: VM[K]['_typeKind'] extends 'optional' | undefined
      ? { [K0 in K]?: ValidatorType<VM[K0]> }
      : { [K0 in K]: ValidatorType<VM[K0]> };
  }[keyof VM] extends infer U
    ? (U extends unknown ? (u: U) => void : never) extends (i: infer I) => void
      ? { [K in keyof I]: I[K] }
      : never
    : never
> {
  return {
    _typeName: Object.keys(validatorMap).length
      ? `{ ${Object.keys(validatorMap)
          .map(
            key =>
              `${IDENTIFIER_REGEX.test(key) ? key : JSON.stringify(key)}${
                validatorMap[key]._typeKind === 'optional' ? '?' : ''
              }: ${validatorMap[key]._typeName};`,
          )
          .join(' ')} }`
      : '{}',
    _validate(value, expression) {
      if (value === null || Array.isArray(value) || typeof value !== 'object') {
        return new ValidationError(expression, this._typeName);
      }
      for (const key of Object.keys(validatorMap)) {
        const subError = validatorMap[key]._validate(
          (value as Record<string, unknown>)[key],
          IDENTIFIER_REGEX.test(key)
            ? `${expression}.${key}`
            : `${expression}[${JSON.stringify(key)}]`,
        );
        if (subError) {
          return new ValidationError(expression, this._typeName, [subError]);
        }
      }
      return null;
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
      return null;
    },
  };
}

export function tuple(): Validator<[]>;
export function tuple<V1 extends ValidatorBase>(v1: V1): Validator<[ValidatorType<V1>]>;
// prettier-ignore
export function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase>(v1: V1, v2: V2): Validator<[ValidatorType<V1>, ValidatorType<V2>]>;
// prettier-ignore
export function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase>(v1: V1, v2: V2, v3: V3): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>]>;
// prettier-ignore
export function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>]>;
// prettier-ignore
export function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>, ValidatorType<V5>]>;
// prettier-ignore
export function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>, ValidatorType<V5>, ValidatorType<V6>]>;
// prettier-ignore
export function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>, ValidatorType<V5>, ValidatorType<V6>, ValidatorType<V7>]>;
// prettier-ignore
export function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase, V8 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7, v8: V8): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>, ValidatorType<V5>, ValidatorType<V6>, ValidatorType<V7>, ValidatorType<V8>]>;
// prettier-ignore
export function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase, V8 extends ValidatorBase, V9 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7, v8: V8, v9: V9): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>, ValidatorType<V5>, ValidatorType<V6>, ValidatorType<V7>, ValidatorType<V8>, ValidatorType<V9>]>;
// prettier-ignore
export function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase, V8 extends ValidatorBase, V9 extends ValidatorBase, V10 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7, v8: V8, v9: V9, v10: V10): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>, ValidatorType<V5>, ValidatorType<V6>, ValidatorType<V7>, ValidatorType<V8>, ValidatorType<V9>, ValidatorType<V10>]>;
export function tuple(...validators: ValidatorBase[]): ValidatorBase {
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
      return null;
    },
  };
}

// prettier-ignore
export function union<V1 extends ValidatorBase, V2 extends ValidatorBase>(v1: V1, v2: V2): Validator<ValidatorType<V1> | ValidatorType<V2>, 'union'>;
// prettier-ignore
export function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase>(v1: V1, v2: V2, v3: V3): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3>, 'union'>;
// prettier-ignore
export function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4>, 'union'>;
// prettier-ignore
export function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4> | ValidatorType<V5>, 'union'>;
// prettier-ignore
export function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4> | ValidatorType<V5> | ValidatorType<V6>, 'union'>;
// prettier-ignore
export function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4> | ValidatorType<V5> | ValidatorType<V6> | ValidatorType<V7>, 'union'>;
// prettier-ignore
export function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase, V8 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7, v8: V8): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4> | ValidatorType<V5> | ValidatorType<V6> | ValidatorType<V7> | ValidatorType<V8>, 'union'>;
// prettier-ignore
export function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase, V8 extends ValidatorBase, V9 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7, v8: V8, v9: V9): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4> | ValidatorType<V5> | ValidatorType<V6> | ValidatorType<V7> | ValidatorType<V8> | ValidatorType<V9>, 'union'>;
// prettier-ignore
export function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase, V8 extends ValidatorBase, V9 extends ValidatorBase, V10 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7, v8: V8, v9: V9, v10: V10): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4> | ValidatorType<V5> | ValidatorType<V6> | ValidatorType<V7> | ValidatorType<V8> | ValidatorType<V9> | ValidatorType<V10>, 'union'>;
export function union(...validators: ValidatorBase[]): ValidatorBase {
  return {
    _typeKind: 'union',
    _typeName: validators.map(validator => validator._typeName).join(' | '),
    _validate(value, expression) {
      const subErrors: ValidationError[] = [];
      for (const validator of validators) {
        const subError = validator._validate(value, expression);
        if (!subError) {
          return null;
        }
        subErrors.push(subError);
      }
      return new ValidationError(expression, this._typeName, subErrors);
    },
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

export function parseJSON<T>(json: string, validator: Validator<T>, expression = 'value'): T {
  const value = JSON.parse(json) as unknown;
  validate(value, validator, expression);
  return value;
}
