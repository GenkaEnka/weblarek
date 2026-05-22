import { Component } from './Component';
import { IEvents } from './events';
import { IProduct } from '../../types/index';
import { ensureElement } from '../../utils/utils';

export class Card extends Component<IProduct> {
    protected _title: HTMLElement;
    protected _price: HTMLElement;

    constructor(container: HTMLElement, protected events?: IEvents) {
        super(container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
    }

    set title(value: string) {
        this._title.textContent = value;
    }

    set price(value: number | null) {
        if (value === null) {
            this._price.textContent = 'Бесценно';
        } else {
            this._price.textContent = `${value} синапсов`;
        }
    }

    render(data?: Partial<IProduct>): HTMLElement {
        if (data) {
            if (data.title) this.title = data.title;
            if (data.price !== undefined) this.price = data.price;
        }
        return this.container;
    }
}