import { SendableObj } from 'cg-webworker/core';
import { CompareVal } from '../../../messaging/CompareVal';
import { executeDataStoreQueryByProxy } from '../querying/executeDataStoreQueryByProxy';
import { ResultSetFilter } from './filterResultSet';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFilterFuncFromPredicate = <TType extends SendableObj<any>>(
    predicate: ResultSetFilter<TType>
): ((target: TType) => boolean) => {
    let getValue: (target: TType) => CompareVal;
    if ('query' in predicate) {
        getValue = (obj: TType) => executeDataStoreQueryByProxy(obj, predicate.query.path);
    } else {
        getValue = (obj: TType) => obj[predicate.prop];
    }

    if ('eq' in predicate) {
        return (target: TType) => getValue(target) === predicate.eq;
    } else if ('notEq' in predicate) {
        return (target: TType) => getValue(target) !== predicate.notEq;
    } else if ('matches' in predicate) {
        return (target: TType) => predicate.matches.test(getValue(target) as string) === !predicate.negate;
    } else if ('in' in predicate) {
        return (target: TType) => predicate.in.includes(getValue(target));
    } else if ('notIn' in predicate) {
        return (target: TType) => !predicate.notIn.includes(getValue(target));
    } else if ('range' in predicate) {
        return (target: TType) => {
            const val = getValue(target);
            switch (typeof val) {
                case 'bigint':
                case 'number':
                case 'boolean':
                case 'string':
                case 'object':
                default:
                    throw new Error('Unsupported range comparison type: ' + typeof val);
            }
        };
    } else {
        const otherProps = Object.getOwnPropertyNames(predicate).filter(
            (prop) => ['prop', 'query'].includes(prop) === false
        );
        throw new Error(`No known predicate prop found. Recevied: ${JSON.stringify(otherProps)}`);
    }
};
