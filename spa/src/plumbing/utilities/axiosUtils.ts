import {ErrorFactory} from '../errors/errorFactory';

/*
 * Utilities related to the Axios library
 */
export class AxiosUtils {

    /*
     * Axios has a known issue where it swallows parse errors, so we throw an error in the way Axios should
     * https://github.com/axios/axios/issues/61
     */
    public static checkJson(data: any): void {

        if (typeof data !== 'object') {
            const error: any = ErrorFactory.fromJsonParseError();
            error.response = {
                status: 200,
            };
            throw error;
        }
    }
}
