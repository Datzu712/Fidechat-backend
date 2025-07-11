import { readFile } from 'node:fs/promises';
import { pathExists } from './path-exists';
import { Logger } from '../logger.service';

export async function safeParseJSONFile<T extends object>(path: string): Promise<T | null> {
    if (!(await pathExists(path))) throw new Error(`JSON file does not exist: ${path}`);

    try {
        const fileContent = await readFile(path, 'utf-8');
        return JSON.parse(fileContent) as T;
    } catch (cause) {
        Logger.warn(new Error(`Failed to parse JSON file at ${path}: ${(cause as Error).message}`, { cause }));
    }

    return null;
}
