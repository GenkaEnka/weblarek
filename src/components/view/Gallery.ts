import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class Gallery extends Component<{}> {
    protected _gallery: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this._gallery = ensureElement<HTMLElement>('.gallery', container);
    }

    set items(items: HTMLElement[]) {
        this._gallery.replaceChildren(...items);
    }
}
