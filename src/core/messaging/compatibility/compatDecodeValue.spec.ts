import { compatDecodeValue } from './compatDecodeValue';

describe('compatDecodeValue', () => {
    describe('in LEGACY mode', () => {
        let origLegacyValue: string | undefined;
        beforeAll(() => {
            origLegacyValue = process.env.LEGACY;
            process.env.LEGACY = 'true';
        });
        afterAll(() => {
            process.env.LEGACY = origLegacyValue;
        });

        it('should encode maps', () => {
            const actual = compatDecodeValue(
                {
                    thing: {
                        __magic: 'Map',
                        value: [
                            [1, 1234],
                            [null, null],
                            [3, undefined],
                            ['Test', 'Testing'],
                        ],
                    },
                },
                new WeakMap()
            );
            expect(actual).toEqual({
                thing: new Map<any, any>([
                    [1, 1234],
                    [null, null],
                    [3, undefined],
                    ['Test', 'Testing'],
                ]),
            });
        });
        it('should encode nested Maps', () => {
            const actual = compatDecodeValue(
                {
                    thing: {
                        __magic: 'Map',
                        value: [
                            [1, 1234],
                            ['Test', { __magic: 'Map', value: [['Testing', true]] }],
                        ],
                    },
                },
                new WeakMap()
            );
            expect(actual).toEqual({
                thing: new Map<any, any>([
                    [1, 1234],
                    ['Test', new Map([['Testing', true]])],
                ]),
            });
        });
        it('should encode sets', () => {
            const actual = compatDecodeValue({ __magic: 'Set', value: [1, 2, 3, 'a', 'b', 'c'] }, new WeakMap());
            expect(actual).toEqual(new Set([1, 2, 3, 'a', 'b', 'c']));
        });
        it('should encode Dates', () => {
            const date = new Date();
            const actual = compatDecodeValue(date, new WeakMap());
            expect(actual).toEqual(date);
        });
        it('should encode Objects', () => {
            const actual = compatDecodeValue({}, new WeakMap());
            expect(actual).toEqual({});
        });
        it('should encode Arrays', () => {
            const actual = compatDecodeValue([1, 2, 5, 8], new WeakMap());
            expect(actual).toEqual([1, 2, 5, 8]);
        });
        it('should encode nested values', () => {
            const actual = compatDecodeValue(
                [
                    {
                        __magic: 'Map',
                        value: [
                            [1, 1234],
                            [null, null],
                            [3, undefined],
                            ['Test', 'Testing'],
                        ],
                    },
                    { __magic: 'Set', value: ['a', false, null, undefined, { t: 't' }] },
                    {
                        anotherMap: {
                            __magic: 'Map',
                            value: [
                                [1, 1234],
                                [null, null],
                                [3, undefined],
                                ['Test', 'Testing'],
                            ],
                        },
                    },
                ],
                new WeakMap()
            );
            expect(actual).toEqual([
                new Map<any, any>([
                    [1, 1234],
                    [null, null],
                    [3, undefined],
                    ['Test', 'Testing'],
                ]),
                new Set(['a', false, null, undefined, { t: 't' }]),
                {
                    anotherMap: new Map<any, any>([
                        [1, 1234],
                        [null, null],
                        [3, undefined],
                        ['Test', 'Testing'],
                    ]),
                },
            ]);
        });

        it('should leave the original object unmutated', () => {
            const a: any = { v: [1, 2, 3] };
            const b = { v: [4, 5], av: a.v, a: a };
            a.b = b;
            const result = compatDecodeValue({ a, b }, new WeakMap());
            expect(result.a).not.toBe(a);
            expect(result.b).not.toBe(b);
            expect(result.a.b).not.toBe(b);
            expect(result.b.a).not.toBe(a);
            expect(result.b.av).not.toBe(a.v);
        });

        it('should handle simple circular references', () => {
            const a: any = { v: [1, 2, 3] };
            const b = { v: [4, 5], av: a.v, a: a };
            a.b = b;
            expect(compatDecodeValue({ a, b }, new WeakMap())).toEqual({ a, b });
        });
    });
});
