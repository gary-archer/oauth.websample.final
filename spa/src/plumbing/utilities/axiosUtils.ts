export class AxiosUtils {

    /*
     * Axios has a known issue where it swallows parse errors
     * We therefore throw an error in the way Axios should
     * https://github.com/axios/axios/issues/61
     */
    public static checkJson(data: any): void {

        if (typeof data !== 'object') {
            const error: any = new Error('JSON Parse Error');
            error.response = {
                status: 200,
            };
            throw error;
        }
    }
}
