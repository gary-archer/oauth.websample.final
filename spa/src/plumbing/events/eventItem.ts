/*
 * A simple event
 */
export interface EventItem {
    name: string;
    callbacks: Array<(data: any) => void>;
}
