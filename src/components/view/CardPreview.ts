import { Card } from '../base/Card';
import { IEvents } from '../base/events';

export class CardPreview extends Card {
    protected _description?: HTMLElement;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container, events);
        this._description = container.querySelector('.card__text') || undefined;

        if (this._button) {
            this._button.addEventListener('click', () => {
                if (this._button && this._button.textContent === 'Купить') {
                    this.events?.emit('card:toBasket', { id: this.id });
                } else {
                    this.events?.emit('card:deleteFromBasket', { id: this.id });
                }
            });
        }
    }

    set description(value: string) {
        if (this._description) {
            this._description.textContent = value;
        }
    }

    set inCart(value: boolean) {
        if (this._button) {
            this._button.textContent = value ? 'Удалить из корзины' : 'Купить';
        }
    }

    set price(value: number | null) {
        if (value === null) {
            this._price.textContent = 'Бесценно';
            if (this._button) {
                this._button.disabled = true;
                this._button.textContent = 'Недоступно';
            }
        } else {
            this._price.textContent = `${value} синапсов`;
            if (this._button) {
                this._button.disabled = false;
            }
        }
    }
}