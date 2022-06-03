import { query } from './query';

describe('makeQueryProxy', () => {
    it('should return empty array when state is returned', () => {
        expect(query((state) => state)).toEqual({ q: 'proxy', path: [] });
    });

    it('should return expected query for single prop', () => {
        expect(query((state) => state.asdf)).toEqual({ q: 'proxy', path: [{ type: 'PROP', propKey: 'asdf' }] });
        expect(query((state) => state.bar)).toEqual({ q: 'proxy', path: [{ type: 'PROP', propKey: 'bar' }] });
    });

    it('should work for deeply nested props', () => {
        type State = {
            asdf: {
                foo: {
                    bar: string;
                };
            };
        };
        expect(query((state: State) => state.asdf.foo)).toEqual({
            q: 'proxy',
            path: [
                { type: 'PROP', propKey: 'asdf' },
                { type: 'PROP', propKey: 'foo' },
            ],
        });
        expect(query((state: State) => state.asdf.foo.bar)).toEqual({
            q: 'proxy',
            path: [
                { type: 'PROP', propKey: 'asdf' },
                { type: 'PROP', propKey: 'foo' },
                { type: 'PROP', propKey: 'bar' },
            ],
        });
    });

    it('should work for Map functions like "get"', () => {
        type State = {
            asdf: Map<string, number>;
            nums: Map<number, string>;
        };
        expect(query((state: State) => state.asdf.get('asdf'))).toEqual({
            q: 'proxy',
            path: [
                { type: 'PROP', propKey: 'asdf' },
                { type: 'PROP', propKey: 'get' },
                { type: 'FUNC', argumentsList: ['asdf'] },
            ],
        });
        const scopeVar = 1234;
        expect(query((state: State) => state.nums.get(scopeVar - 5))).toEqual({
            q: 'proxy',
            path: [
                { type: 'PROP', propKey: 'nums' },
                { type: 'PROP', propKey: 'get' },
                { type: 'FUNC', argumentsList: [1229] },
            ],
        });
    });
    it('should work for Set functions like "has"', () => {
        type State = {
            asdf: Set<string>;
            nums: Set<number>;
        };
        expect(query((state: State) => state.asdf.has('text'))).toEqual({
            q: 'proxy',
            path: [
                { type: 'PROP', propKey: 'asdf' },
                { type: 'PROP', propKey: 'has' },
                { type: 'FUNC', argumentsList: ['text'] },
            ],
        });
        const scopeVar = 1234;
        expect(query((state: State) => state.nums.has(scopeVar - 5))).toEqual({
            q: 'proxy',
            path: [
                { type: 'PROP', propKey: 'nums' },
                { type: 'PROP', propKey: 'has' },
                { type: 'FUNC', argumentsList: [1229] },
            ],
        });
    });
    it('should work for Array functions like "includes"', () => {
        type State = {
            asdf: string[];
            nums: number[];
        };
        expect(query((state: State) => state.asdf.includes('some val'))).toEqual({
            q: 'proxy',
            path: [
                { type: 'PROP', propKey: 'asdf' },
                { type: 'PROP', propKey: 'includes' },
                { type: 'FUNC', argumentsList: ['some val'] },
            ],
        });
    });

    it('should throw an error for Array functions like "some"', () => {
        type State = {
            asdf: string[];
            nums: number[];
        };
        expect(() => query((state: State) => state.asdf.some((e) => e))).toThrowError(
            'Functions and symbols cannot be passed as arguments.'
        );
    });

    it('should work for Array indexing', () => {
        type State = {
            asdf: string[];
            nums: number[];
        };
        expect(query((state: State) => state.asdf[123])).toEqual({
            q: 'proxy',
            path: [
                { propKey: 'asdf', type: 'PROP' },
                { propKey: '123', type: 'PROP' },
            ],
        });
    });

    it('should throw an error for double reference', () => {
        type State = {
            strings: string[];
        };
        expect(() => {
            query((state: State) => state.strings[state.strings.length - 1]);
        }).toThrowError('Can only reference state once when creating query.');
    });
});
