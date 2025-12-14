import type { BindParameters } from 'oracledb';

// Adapted on https://github.com/oracle/node-oracledb/issues/699#issuecomment-524009129
export type SqlValue = string | number | Date | boolean | null;
export type SqlParameter = SqlValue | SqlValue[];

export function sql(queryParts: TemplateStringsArray, ...parameters: SqlParameter[]): [string, BindParameters] {
    if (queryParts.length !== parameters.length + 1) {
        throw new Error(`Invalid number of parameters: expected ${queryParts.length - 1}, got ${parameters.length}`);
    }

    return [
        queryParts
            .map((part, index) => (index < parameters.length ? `${part}${parameterIndexes(parameters, index)}` : part))
            .join(''),
        parameters.flat(),
    ];
}

function parameterIndexes(currentParameters: SqlParameter[], index: number): string {
    const newIndex = currentParameters
        .slice(0, index)
        .reduce<number>((p, c) => p + (Array.isArray(c) ? c.length : 1), 0);
    const parameter = currentParameters[index];

    if (Array.isArray(parameter)) {
        const indexes = new Array<number>(parameter.length).fill(index).map((e, i) => e + i);
        return ':' + indexes.join(', :');
    } else {
        return ':' + String(newIndex);
    }
}
