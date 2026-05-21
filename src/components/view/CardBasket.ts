import { Card } from '../base/Card';
import { IEvents } from '../base/events';

export class CardBasket extends Card {
    protected _index: HTMLElement;
    protected _deleteButton: HTMLButtonElement;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container, events);
        this._index = container.querySelector('.basket__item-index') as HTMLElement;
        this._deleteButton = container.querySelector('.basket__item-delete') as HTMLButtonElement;

        this._deleteButton.addEventListener('click', () => {
            this.events?.emit('basket:delete', { id: this.id });
        });
    }

    set index(value: number) {
        this._index.textContent = String(value);
    }

    set price(value: number | null) {
        if (value === null) {
            this._price.textContent = 'Бесценно';
        } else {
            this._price.textContent = `${value} синапсов`;
        }
    }
}