"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryParseJSON = exports.parseJSON = exports.tryValidate = exports.validate = exports.unknown = exports.union = exports.tuple = exports.literal = exports.object = exports.optional = exports.array = exports.string = exports.number = exports.boolean = exports.null_ = exports.ValidationError = void 0;
const IDENTIFIER_REGEX = /^[$A-Za-z_]([$0-9A-Za-z_]*)$/;
class ValidationError extends Error {
    constructor(expression, expectedType, subErrors = []) {
        super([
            `'${expression}' is not of type '${expectedType}'`,
            ...subErrors.map(subError => subError.message
                .split('\n')
                .map(line => `  ${line}`)
                .join('\n')),
        ].join('\n'));
        this.expression = expression;
        this.expectedType = expectedType;
        this.subErrors = subErrors;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
function null_() {
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
exports.null_ = null_;
function boolean() {
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
exports.boolean = boolean;
function number() {
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
exports.number = number;
function string() {
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
exports.string = string;
function array(validator) {
    return {
        _typeName: validator._typeKind === 'union' ? `(${validator._typeName})[]` : `${validator._typeName}[]`,
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
exports.array = array;
function optional(validator) {
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
exports.optional = optional;
function object(validatorMap) {
    return {
        _typeName: Object.keys(validatorMap).length
            ? `{ ${Object.keys(validatorMap)
                .map(key => `${IDENTIFIER_REGEX.test(key) ? key : JSON.stringify(key)}${validatorMap[key]._typeKind === 'optional' ? '?' : ''}: ${validatorMap[key]._typeName};`)
                .join(' ')} }`
            : '{}',
        _validate(value, expression) {
            if (value === null || Array.isArray(value) || typeof value !== 'object') {
                return new ValidationError(expression, this._typeName);
            }
            for (const key of Object.keys(validatorMap)) {
                const subError = validatorMap[key]._validate(value[key], IDENTIFIER_REGEX.test(key)
                    ? `${expression}.${key}`
                    : `${expression}[${JSON.stringify(key)}]`);
                if (subError) {
                    return new ValidationError(expression, this._typeName, [subError]);
                }
            }
            return null;
        },
    };
}
exports.object = object;
function literal(l) {
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
exports.literal = literal;
function tuple(...validators) {
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
exports.tuple = tuple;
function union(...validators) {
    return {
        _typeKind: 'union',
        _typeName: validators.map(validator => validator._typeName).join(' | '),
        _validate(value, expression) {
            const subErrors = [];
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
exports.union = union;
function unknown() {
    return {
        _typeName: 'unknown',
        _validate() {
            return null;
        },
    };
}
exports.unknown = unknown;
function validate(value, validator, expression = 'value') {
    const error = validator._validate(value, expression);
    if (error) {
        throw error;
    }
}
exports.validate = validate;
function tryValidate(value, validator) {
    return validator._validate(value, 'value') == null;
}
exports.tryValidate = tryValidate;
function parseJSON(json, validator, expression = 'value') {
    const value = JSON.parse(json);
    validate(value, validator, expression);
    return value;
}
exports.parseJSON = parseJSON;
function tryParseJSON(json, validator) {
    try {
        const value = JSON.parse(json);
        return tryValidate(value, validator) ? value : undefined;
    }
    catch (_a) {
        return undefined;
    }
}
exports.tryParseJSON = tryParseJSON;
