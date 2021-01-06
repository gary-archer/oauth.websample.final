import {EventItem} from './eventItem';

/*
 * A simple event emitter class
 */
export class EventEmitter {

    /*
     * Subscribe to a named event
     */
    public static subscribe(name: string, callback: (data: any) => void): void {

        let item = EventEmitter._events.find((e) => e.name === name);
        if (!item) {

            item = {
                name,
                callbacks: [],
            };
            EventEmitter._events.push(item);
        }

        item.callbacks.push(callback);
    }

    /*
     * Unsubscribe and remove storage
     */
    public static unsubscribe(name: string, callback: (data: any) => void): void {

        const item = EventEmitter._events.find((e) => e.name === name);
        if (item) {
            item.callbacks = item.callbacks.filter((c) => c !== callback);
            if (item.callbacks.length === 0) {
                EventEmitter._events = EventEmitter._events.filter((e) => e.name !== name);
            }
        }
    }

    /*
     * Dispatch named event messages
     */
    public static dispatch(name: string, data: any): void {

        const item = EventEmitter._events.find((e) => e.name === name);
        if (item) {
            item.callbacks.forEach((callback) => callback(data));
        }
    }

    private static _events: EventItem[] = [];
}
