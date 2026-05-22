import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class Header extends Component<{}> {
    protected _counter: HTMLElement;
    protected _basketButton: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this._counter = ensureElement<HTMLElement>('.header__basket-counter', container);
        this._basketButton = ensureElement<HTMLElement>('.header__basket', container);

        this._basketButton.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    set counter(value: number) {
        this._counter.textContent = String(value);
    }
}
