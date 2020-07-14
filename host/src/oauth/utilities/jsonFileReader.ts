import fs from 'fs-extra';
import {ApiError} from '../errors/apiError';
import {ErrorCodes} from '../errors/errorCodes';

/*
 * A simple utility to deal with the infrastructure of reading JSON files
 */
export class JsonFileReader {

    /*
     * Do the file reading and return a promise
     */
    public async readData<T>(filePath: string): Promise<T> {

        try {

            // Try the read
            const buffer = await fs.readFile(filePath);
            return JSON.parse(buffer.toString()) as T;

        } catch (e) {

            // Do error translation of file read errors
            throw new ApiError(ErrorCodes.fileReadError, 'Problem encountered reading file data', e.stack);
        }
    }
}
