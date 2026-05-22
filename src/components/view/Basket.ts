import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement, cloneTemplate } from '../../utils/utils';

export class Basket extends Component<{}> {
    protected _list: HTMLElement;
    protected _totalPrice: HTMLElement;
    protected _checkoutButton: HTMLButtonElement;

    constructor(template: HTMLTemplateElement, protected events: IEvents) {
        const container = cloneTemplate<HTMLElement>(template);
        super(container);
        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._totalPrice = ensureElement<HTMLElement>('.basket__price', container);
        this._checkoutButton = ensureElement<HTMLButtonElement>('.basket__button', container);

        // initial state: empty basket -> button disabled
        this._checkoutButton.disabled = true;

        this._checkoutButton.addEventListener('click', () => {
            this.events.emit('order:open');
        });
    }

    set items(items: HTMLElement[]) {
        if (items.length === 0) {
            this._list.innerHTML = '<p>Корзина пуста</p>';
        } else {
            this._list.replaceChildren(...items);
        }
    }

    set total(value: number) {
        this._totalPrice.textContent = `${value} синапсов`;
    }

    set valid(isValid: boolean) {
        this._checkoutButton.disabled = !isValid;
    }

    render(): HTMLElement {
        return this.container;
    }
}