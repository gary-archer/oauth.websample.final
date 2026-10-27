/*
 * // Input from views to influence core API GET behaviors, including an option for error rehearsal
 */
export interface GetOptions {
    forceReload: boolean;
    causeError: boolean;
}
