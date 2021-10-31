import { useState } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';

import { useSubscribeChange } from './useSubscribeChange';
import { QueryKey, SubscribeCallBroker, Unsubscribe } from 'cg-webworker/datastore';

describe('useSubscribeChange', () => {
    let subscribeCallBroker: SubscribeCallBroker;
    let onChangeUnsub: Unsubscribe;
    let latestQuery: QueryKey[];
    let latestCallback: () => void; // eslint-disable-line @typescript-eslint/no-explicit-any

    beforeEach(() => {
        onChangeUnsub = jest.fn();
        subscribeCallBroker = {
            onChange: jest.fn((query, callback, onError) => {
                latestQuery = query;
                latestCallback = callback;
                return onChangeUnsub;
            }),
            onData: jest.fn(),
        } as SubscribeCallBroker;
    });

    it('should execute callback when onchange is first called', () => {
        const mock = jest.fn();
        const { result } = renderHook(() => useSubscribeChange(mock, [], ['some', 'keys'], subscribeCallBroker));
        expect(mock).not.toHaveBeenCalled();
        act(() => {
            latestCallback();
        });
        expect(mock).toHaveBeenCalledTimes(1);
    });
    it('should execute callback when onchange is called multiple times', () => {
        const mock = jest.fn();
        const { result } = renderHook(() => useSubscribeChange(mock, [], ['some', 'keys'], subscribeCallBroker));
        expect(mock).not.toHaveBeenCalled();
        act(() => {
            latestCallback();
        });
        expect(mock).toHaveBeenCalledTimes(1);
        act(() => {
            latestCallback();
        });
        expect(mock).toHaveBeenCalledTimes(2);
    });

    it('should subscribe only once when passed the same QueryKey object', () => {
        const memoizedQueryKeys = ['some', 'keys'];
        const { result, rerender } = renderHook(
            ({ queryKeys }) => useSubscribeChange(() => {}, [], queryKeys, subscribeCallBroker),
            {
                initialProps: { queryKeys: memoizedQueryKeys },
            }
        );
        expect(subscribeCallBroker.onChange).toHaveBeenCalledTimes(1);
        rerender({ queryKeys: memoizedQueryKeys });
        expect(subscribeCallBroker.onChange).toHaveBeenCalledTimes(1);
    });
    it('should subscribe only once when QueryKey simple values are the same', () => {
        const { result, rerender } = renderHook(
            ({ queryKeys }) => useSubscribeChange(() => {}, [], queryKeys, subscribeCallBroker),
            {
                initialProps: { queryKeys: ['some', 'keys'] },
            }
        );
        expect(subscribeCallBroker.onChange).toHaveBeenCalledTimes(1);
        rerender({ queryKeys: ['some', 'keys'] });
        expect(subscribeCallBroker.onChange).toHaveBeenCalledTimes(1);
    });
    it('should subscribe only once when QueryKey complex values are the same', () => {
        const { result, rerender } = renderHook(
            ({ queryKeys }) => useSubscribeChange(() => {}, [], queryKeys, subscribeCallBroker),
            {
                initialProps: { queryKeys: ['some', 'keys', [1, 2, 3, 4]] },
            }
        );
        expect(subscribeCallBroker.onChange).toHaveBeenCalledTimes(1);
        rerender({ queryKeys: ['some', 'keys', [1, 2, 3, 4]] });
        expect(subscribeCallBroker.onChange).toHaveBeenCalledTimes(1);
    });
    it('should subscribe when QueryKey simple values are different', () => {
        const { result, rerender } = renderHook(
            ({ queryKeys }) => useSubscribeChange(() => {}, [], queryKeys, subscribeCallBroker),
            {
                initialProps: { queryKeys: ['some', 'keys'] },
            }
        );
        expect(subscribeCallBroker.onChange).toHaveBeenCalledTimes(1);
        rerender({ queryKeys: ['some', 'different keys'] });
        expect(subscribeCallBroker.onChange).toHaveBeenCalledTimes(2);
    });
    it('should subscribe when QueryKey complex values are different', () => {
        const { result, rerender } = renderHook(
            ({ queryKeys }) => useSubscribeChange(() => {}, [], queryKeys, subscribeCallBroker),
            {
                initialProps: { queryKeys: ['some', 'keys', [1, 2, 3, 4]] },
            }
        );
        expect(subscribeCallBroker.onChange).toHaveBeenCalledTimes(1);
        rerender({ queryKeys: ['some', 'keys', [1, 2, 3, 4, 5]] });
        expect(subscribeCallBroker.onChange).toHaveBeenCalledTimes(2);
    });

    it('should not unsubscribe when passed the same QueryKey object', () => {
        const memoizedQueryKeys = ['some', 'keys'];
        const { result, rerender } = renderHook(
            ({ queryKeys }) => useSubscribeChange(() => {}, [], queryKeys, subscribeCallBroker),
            {
                initialProps: { queryKeys: memoizedQueryKeys },
            }
        );
        expect(onChangeUnsub).not.toHaveBeenCalled();
        rerender({ queryKeys: memoizedQueryKeys });
        expect(onChangeUnsub).not.toHaveBeenCalled();
    });
    it('should not unsubscribe when QueryKey simple values are the same', () => {
        const { result, rerender } = renderHook(
            ({ queryKeys }) => useSubscribeChange(() => {}, [], queryKeys, subscribeCallBroker),
            {
                initialProps: { queryKeys: ['some', 'keys'] },
            }
        );
        expect(onChangeUnsub).not.toHaveBeenCalled();
        rerender({ queryKeys: ['some', 'keys'] });
        expect(onChangeUnsub).not.toHaveBeenCalled();
    });
    it('should not unsubscribe when QueryKey complex values are the same', () => {
        const { result, rerender } = renderHook(
            ({ queryKeys }) => useSubscribeChange(() => {}, [], queryKeys, subscribeCallBroker),
            {
                initialProps: { queryKeys: ['some', 'keys', [1, 2, 3, 4]] },
            }
        );
        expect(onChangeUnsub).not.toHaveBeenCalled();
        rerender({ queryKeys: ['some', 'keys', [1, 2, 3, 4]] });
        expect(onChangeUnsub).not.toHaveBeenCalled();
    });
    it('should unsubscribe when QueryKey simple values are different', () => {
        const { result, rerender } = renderHook(
            ({ queryKeys }) => useSubscribeChange(() => {}, [], queryKeys, subscribeCallBroker),
            {
                initialProps: { queryKeys: ['some', 'keys'] },
            }
        );
        expect(onChangeUnsub).not.toHaveBeenCalled();
        rerender({ queryKeys: ['some', 'different keys'] });
        expect(onChangeUnsub).toHaveBeenCalledTimes(1);
    });
    it('should unsubscribe when QueryKey complex values are different', () => {
        const { result, rerender } = renderHook(
            ({ queryKeys }) => useSubscribeChange(() => {}, [], queryKeys, subscribeCallBroker),
            {
                initialProps: { queryKeys: ['some', 'keys', [1, 2, 3, 4]] },
            }
        );
        expect(onChangeUnsub).not.toHaveBeenCalled();
        rerender({ queryKeys: ['some', 'keys', [1, 2, 3, 4, 5]] });
        expect(onChangeUnsub).toHaveBeenCalledTimes(1);
    });
});
