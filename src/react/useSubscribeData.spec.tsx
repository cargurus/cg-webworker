import { renderHook, act } from '@testing-library/react-hooks';
import { SubscribeCallBroker, QueryKey, Unsubscribe } from 'cg-webworker/datastore';

import { useSubscribeData } from './useSubscribeData';

describe('useSubscribeData', () => {
    let subscribeCallBroker: SubscribeCallBroker;
    let onDataUnsub: Unsubscribe;
    let latestQuery: QueryKey[];
    let latestCallback: (data: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

    beforeEach(() => {
        onDataUnsub = jest.fn();
        subscribeCallBroker = {
            onChange: jest.fn(),
            onData: jest.fn((query, callback, onError) => {
                latestQuery = query;
                latestCallback = callback;
                return onDataUnsub;
            }),
        } as SubscribeCallBroker;
    });

    it('should return undefined when initial call returns', () => {
        const { result } = renderHook(() => useSubscribeData(['some', 'keys'], subscribeCallBroker));
        expect(result.current).toBeUndefined();
    });
    it('should return data when first result is returned', () => {
        const { result } = renderHook(() => useSubscribeData(['some', 'keys'], subscribeCallBroker));
        act(() => {
            latestCallback({ some: 'data' });
        });
        expect(result.current).toEqual({ some: 'data' });
    });
    it('should return data when subsequent data changes', () => {
        const { result } = renderHook(() => useSubscribeData(['some', 'keys'], subscribeCallBroker));
        act(() => {
            latestCallback({ some: 'data' });
        });
        act(() => {
            latestCallback({ some: 'more data' });
        });
        expect(result.current).toEqual({ some: 'more data' });
    });

    it('should subscribe only once when passed the same QueryKey object', () => {
        const memoizedQueryKeys = ['some', 'keys'];
        const { result, rerender } = renderHook(({ queryKeys }) => useSubscribeData(queryKeys, subscribeCallBroker), {
            initialProps: { queryKeys: memoizedQueryKeys },
        });
        expect(subscribeCallBroker.onData).toHaveBeenCalledTimes(1);
        rerender({ queryKeys: memoizedQueryKeys });
        expect(subscribeCallBroker.onData).toHaveBeenCalledTimes(1);
    });
    it('should subscribe only once when QueryKey simple values are the same', () => {
        const { result, rerender } = renderHook(({ queryKeys }) => useSubscribeData(queryKeys, subscribeCallBroker), {
            initialProps: { queryKeys: ['some', 'keys'] },
        });
        expect(subscribeCallBroker.onData).toHaveBeenCalledTimes(1);
        rerender({ queryKeys: ['some', 'keys'] });
        expect(subscribeCallBroker.onData).toHaveBeenCalledTimes(1);
    });
    it('should subscribe only once when QueryKey complex values are the same', () => {
        const { result, rerender } = renderHook(({ queryKeys }) => useSubscribeData(queryKeys, subscribeCallBroker), {
            initialProps: { queryKeys: ['some', 'keys', [1, 2, 3, 4]] },
        });
        expect(subscribeCallBroker.onData).toHaveBeenCalledTimes(1);
        rerender({ queryKeys: ['some', 'keys', [1, 2, 3, 4]] });
        expect(subscribeCallBroker.onData).toHaveBeenCalledTimes(1);
    });
    it('should subscribe when QueryKey simple values are different', () => {
        const { result, rerender } = renderHook(({ queryKeys }) => useSubscribeData(queryKeys, subscribeCallBroker), {
            initialProps: { queryKeys: ['some', 'keys'] },
        });
        expect(subscribeCallBroker.onData).toHaveBeenCalledTimes(1);
        rerender({ queryKeys: ['some', 'different keys'] });
        expect(subscribeCallBroker.onData).toHaveBeenCalledTimes(2);
    });
    it('should subscribe when QueryKey complex values are different', () => {
        const { result, rerender } = renderHook(({ queryKeys }) => useSubscribeData(queryKeys, subscribeCallBroker), {
            initialProps: { queryKeys: ['some', 'keys', [1, 2, 3, 4]] },
        });
        expect(subscribeCallBroker.onData).toHaveBeenCalledTimes(1);
        rerender({ queryKeys: ['some', 'keys', [1, 2, 3, 4, 5]] });
        expect(subscribeCallBroker.onData).toHaveBeenCalledTimes(2);
    });

    it('should not unsubscribe when passed the same QueryKey object', () => {
        const memoizedQueryKeys = ['some', 'keys'];
        const { result, rerender } = renderHook(({ queryKeys }) => useSubscribeData(queryKeys, subscribeCallBroker), {
            initialProps: { queryKeys: memoizedQueryKeys },
        });
        expect(onDataUnsub).not.toHaveBeenCalled();
        rerender({ queryKeys: memoizedQueryKeys });
        expect(onDataUnsub).not.toHaveBeenCalled();
    });
    it('should not unsubscribe when QueryKey simple values are the same', () => {
        const { result, rerender } = renderHook(({ queryKeys }) => useSubscribeData(queryKeys, subscribeCallBroker), {
            initialProps: { queryKeys: ['some', 'keys'] },
        });
        expect(onDataUnsub).not.toHaveBeenCalled();
        rerender({ queryKeys: ['some', 'keys'] });
        expect(onDataUnsub).not.toHaveBeenCalled();
    });
    it('should not unsubscribe when QueryKey complex values are the same', () => {
        const { result, rerender } = renderHook(({ queryKeys }) => useSubscribeData(queryKeys, subscribeCallBroker), {
            initialProps: { queryKeys: ['some', 'keys', [1, 2, 3, 4]] },
        });
        expect(onDataUnsub).not.toHaveBeenCalled();
        rerender({ queryKeys: ['some', 'keys', [1, 2, 3, 4]] });
        expect(onDataUnsub).not.toHaveBeenCalled();
    });
    it('should unsubscribe when QueryKey simple values are different', () => {
        const { result, rerender } = renderHook(({ queryKeys }) => useSubscribeData(queryKeys, subscribeCallBroker), {
            initialProps: { queryKeys: ['some', 'keys'] },
        });
        expect(onDataUnsub).not.toHaveBeenCalled();
        rerender({ queryKeys: ['some', 'different keys'] });
        expect(onDataUnsub).toHaveBeenCalledTimes(1);
    });
    it('should unsubscribe when QueryKey complex values are different', () => {
        const { result, rerender } = renderHook(({ queryKeys }) => useSubscribeData(queryKeys, subscribeCallBroker), {
            initialProps: { queryKeys: ['some', 'keys', [1, 2, 3, 4]] },
        });
        expect(onDataUnsub).not.toHaveBeenCalled();
        rerender({ queryKeys: ['some', 'keys', [1, 2, 3, 4, 5]] });
        expect(onDataUnsub).toHaveBeenCalledTimes(1);
    });
});
