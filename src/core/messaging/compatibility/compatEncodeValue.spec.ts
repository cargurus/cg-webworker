import { compatEncodeValue } from './compatEncodeValue';
import { compatDecodeValue } from './compatDecodeValue';

describe('compatEncodeValue', () => {
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
            const actual = compatEncodeValue(
                {
                    thing: new Map<any, any>([
                        [1, 1234],
                        [null, null],
                        [3, undefined],
                        ['Test', 'Testing'],
                    ]),
                },
                new WeakMap()
            );
            expect(actual).toEqual({
                thing: {
                    __magic: 'Map',
                    value: [
                        [1, 1234],
                        [null, null],
                        [3, undefined],
                        ['Test', 'Testing'],
                    ],
                },
            });
        });
        it('should encode nested Maps', () => {
            const actual = compatEncodeValue(
                {
                    thing: new Map<any, any>([
                        [1, 1234],
                        ['Test', new Map([['Testing', true]])],
                    ]),
                },
                new WeakMap()
            );
            expect(actual).toEqual({
                thing: {
                    __magic: 'Map',
                    value: [
                        [1, 1234],
                        ['Test', { __magic: 'Map', value: [['Testing', true]] }],
                    ],
                },
            });
        });
        it('should encode sets', () => {
            const actual = compatEncodeValue(new Set([1, 2, 3, 'a', 'b', 'c']), new WeakMap());
            expect(actual).toEqual({ __magic: 'Set', value: [1, 2, 3, 'a', 'b', 'c'] });
        });
        it('should encode Dates', () => {
            const date = new Date();
            const actual = compatEncodeValue(date, new WeakMap());
            expect(actual).toEqual(date);
        });
        it('should encode Objects', () => {
            const actual = compatEncodeValue({}, new WeakMap());
            expect(actual).toEqual({});
        });
        it('should encode Arrays', () => {
            const actual = compatEncodeValue([1, 2, 5, 8], new WeakMap());
            expect(actual).toEqual([1, 2, 5, 8]);
        });
        it('should encode nested values', () => {
            const actual = compatEncodeValue(
                [
                    new Map<any, any>([
                        [1, 1234],
                        [null, null],
                        [3, undefined],
                        ['Test', 'Testing'],
                    ]),
                    new Set<any>(['a', false, null, undefined, { t: 't' }]),
                    {
                        anotherMap: new Map<any, any>([
                            [1, 1234],
                            [null, null],
                            [3, undefined],
                            ['Test', 'Testing'],
                        ]),
                    },
                ],
                new WeakMap()
            );
            expect(actual).toEqual([
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
            ]);
        });

        it('should handle circular references', () => {
            const a: any = { v: [1, 2, 3] };
            const b = { v: [4, 5], av: a.v, a: a };
            a.b = b;
            expect(compatEncodeValue({ a, b }, new WeakMap())).toEqual({ a, b });
        });

        it('should leave the original object unmutated', () => {
            const a: any = { v: [1, 2, 3] };
            const b = { v: [4, 5], av: a.v, a: a };
            a.b = b;
            const result = compatEncodeValue({ a, b }, new WeakMap());
            expect(result.a).not.toBe(a);
            expect(result.b).not.toBe(b);
            expect(result.a.b).not.toBe(b);
            expect(result.b.a).not.toBe(a);
            expect(result.b.av).not.toBe(a.v);
        });

        describe('integration with compatDecodeValue', () => {
            it('should encode maps', () => {
                const actual = compatDecodeValue(
                    compatEncodeValue(
                        {
                            thing: new Map<any, any>([
                                [1, 1234],
                                [null, null],
                                [3, undefined],
                                ['Test', 'Testing'],
                            ]),
                        },
                        new WeakMap()
                    ),
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
                    compatEncodeValue(
                        {
                            thing: new Map<any, any>([
                                [1, 1234],
                                ['Test', new Map([['Testing', true]])],
                            ]),
                        },
                        new WeakMap()
                    ),
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
                const actual = compatDecodeValue(
                    compatEncodeValue(new Set([1, 2, 3, 'a', 'b', 'c']), new Map()),
                    new WeakMap()
                );
                expect(actual).toEqual(new Set([1, 2, 3, 'a', 'b', 'c']));
            });
            it('should encode Dates', () => {
                const date = new Date();
                const actual = compatDecodeValue(compatEncodeValue(date, new Map()), new WeakMap());
                expect(actual).toEqual(date);
            });
            it('should encode Objects', () => {
                const actual = compatDecodeValue(compatEncodeValue({}, new Map()), new WeakMap());
                expect(actual).toEqual({});
            });
            it('should encode Arrays', () => {
                const actual = compatDecodeValue(compatEncodeValue([1, 2, 5, 8], new Map()), new WeakMap());
                expect(actual).toEqual([1, 2, 5, 8]);
            });
            it('should encode nested values', () => {
                const actual = compatDecodeValue(
                    compatEncodeValue(
                        [
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
                        ],
                        new WeakMap()
                    ),
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
        });
    });
});
