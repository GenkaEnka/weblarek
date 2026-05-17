/**
 * Base component class
 */
export abstract class Component<T> {
    protected constructor(protected readonly container: HTMLElement) {}

    // DOM manipulation utilities for child components

    // Set image with alternative text
    protected setImage(element: HTMLImageElement, src: string, alt?: string) {
        if (element) {
            element.src = src;
            if (alt) {
                element.alt = alt;
            }
        }
    }

    // Return root DOM element
    render(data?: Partial<T>): HTMLElement {
        Object.assign(this as object, data ?? {});
        return this.container;
    }
}
