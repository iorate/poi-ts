export declare class ValidationError extends Error {
    readonly expression: string;
    readonly expectedType: string;
    readonly subErrors: ValidationError[];
    constructor(expression: string, expectedType: string, subErrors?: ValidationError[]);
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
export declare type ValidatorType<V> = V extends {
    _type?: infer T;
} ? T : never;
export declare function null_(): Validator<null>;
export declare function boolean(): Validator<boolean>;
export declare function number(): Validator<number>;
export declare function string(): Validator<string>;
export declare function array<V extends ValidatorBase>(validator: V): Validator<ValidatorType<V>[]>;
export declare function optional<V extends ValidatorBase>(validator: V): Validator<ValidatorType<V>, 'optional'>;
export declare function object<VM extends Record<string, ValidatorBase>>(validatorMap: VM): Validator<{
    [K in keyof VM]: VM[K]['_typeKind'] extends 'optional' | undefined ? {
        [K0 in K]?: ValidatorType<VM[K0]>;
    } : {
        [K0 in K]: ValidatorType<VM[K0]>;
    };
}[keyof VM] extends infer U ? (U extends unknown ? (u: U) => void : never) extends (i: infer I) => void ? {
    [K in keyof I]: I[K];
} : never : never>;
export declare function literal<L extends boolean | number | string>(l: L): Validator<L>;
export declare function tuple(): Validator<[]>;
export declare function tuple<V1 extends ValidatorBase>(v1: V1): Validator<[ValidatorType<V1>]>;
export declare function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase>(v1: V1, v2: V2): Validator<[ValidatorType<V1>, ValidatorType<V2>]>;
export declare function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase>(v1: V1, v2: V2, v3: V3): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>]>;
export declare function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>]>;
export declare function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>, ValidatorType<V5>]>;
export declare function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>, ValidatorType<V5>, ValidatorType<V6>]>;
export declare function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>, ValidatorType<V5>, ValidatorType<V6>, ValidatorType<V7>]>;
export declare function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase, V8 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7, v8: V8): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>, ValidatorType<V5>, ValidatorType<V6>, ValidatorType<V7>, ValidatorType<V8>]>;
export declare function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase, V8 extends ValidatorBase, V9 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7, v8: V8, v9: V9): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>, ValidatorType<V5>, ValidatorType<V6>, ValidatorType<V7>, ValidatorType<V8>, ValidatorType<V9>]>;
export declare function tuple<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase, V8 extends ValidatorBase, V9 extends ValidatorBase, V10 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7, v8: V8, v9: V9, v10: V10): Validator<[ValidatorType<V1>, ValidatorType<V2>, ValidatorType<V3>, ValidatorType<V4>, ValidatorType<V5>, ValidatorType<V6>, ValidatorType<V7>, ValidatorType<V8>, ValidatorType<V9>, ValidatorType<V10>]>;
export declare function union<V1 extends ValidatorBase, V2 extends ValidatorBase>(v1: V1, v2: V2): Validator<ValidatorType<V1> | ValidatorType<V2>, 'union'>;
export declare function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase>(v1: V1, v2: V2, v3: V3): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3>, 'union'>;
export declare function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4>, 'union'>;
export declare function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4> | ValidatorType<V5>, 'union'>;
export declare function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4> | ValidatorType<V5> | ValidatorType<V6>, 'union'>;
export declare function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4> | ValidatorType<V5> | ValidatorType<V6> | ValidatorType<V7>, 'union'>;
export declare function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase, V8 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7, v8: V8): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4> | ValidatorType<V5> | ValidatorType<V6> | ValidatorType<V7> | ValidatorType<V8>, 'union'>;
export declare function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase, V8 extends ValidatorBase, V9 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7, v8: V8, v9: V9): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4> | ValidatorType<V5> | ValidatorType<V6> | ValidatorType<V7> | ValidatorType<V8> | ValidatorType<V9>, 'union'>;
export declare function union<V1 extends ValidatorBase, V2 extends ValidatorBase, V3 extends ValidatorBase, V4 extends ValidatorBase, V5 extends ValidatorBase, V6 extends ValidatorBase, V7 extends ValidatorBase, V8 extends ValidatorBase, V9 extends ValidatorBase, V10 extends ValidatorBase>(v1: V1, v2: V2, v3: V3, v4: V4, v5: V5, v6: V6, v7: V7, v8: V8, v9: V9, v10: V10): Validator<ValidatorType<V1> | ValidatorType<V2> | ValidatorType<V3> | ValidatorType<V4> | ValidatorType<V5> | ValidatorType<V6> | ValidatorType<V7> | ValidatorType<V8> | ValidatorType<V9> | ValidatorType<V10>, 'union'>;
export declare function validate<T>(value: unknown, validator: Validator<T>, expression?: string): asserts value is T;
export declare function parseJSON<T>(json: string, validator: Validator<T>, expression?: string): T;
