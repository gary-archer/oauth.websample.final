/*
 * A utility to find the base element in the index.html file
 */
export class BasePath {

    public static get(): string {

        const baseElement = document.querySelector('base') as HTMLElement;
        return baseElement?.getAttribute('href') || '/';
    }
}