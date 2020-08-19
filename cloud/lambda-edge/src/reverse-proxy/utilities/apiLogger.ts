/*
 * A simple logger class to output to CloudWatch or a developer PC
 */
export class ApiLogger {

    /*
     * Log info data
     */
    public static info(message: string): void {
        console.log(`info: ${message}`);
    }

    /*
     * Log error data
     */
    public static error(errorData: any): void {
        console.log(JSON.stringify(errorData, null, 2))
    }
}
