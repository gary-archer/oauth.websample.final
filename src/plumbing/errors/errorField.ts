/*
 * A simple error field entity
 */
export interface ErrorField {
    id: number;
    label: string;
    value: string;
    itemType: 'useraction' | 'value' | 'identifier' | 'stack';
}
