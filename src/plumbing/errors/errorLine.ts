/*
 * A simple error line entity
 */
export interface ErrorLine {
    id: number;
    label: string;
    value: string;
    itemType: 'useraction' | 'value' | 'error' | 'stack';
}
