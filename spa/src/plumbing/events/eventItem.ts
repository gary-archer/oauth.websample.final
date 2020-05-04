/*
 * Data for a type of event
 */
export interface EventItem {
    name: string;
    callbacks: ((data: any) => void)[];
}
