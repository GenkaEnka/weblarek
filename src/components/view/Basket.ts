import { Component } from '../base/Component';
import { IProduct } from '../../types/index';

export interface IBasketActions {
    onCheckout: () => void;
    onRemoveItem: (product: IProduct) => void;
}

export class Basket extends Component<IProduct[]> {
    protected _items: IProduct[] = [];
    protected _actions: IBasketActions;
    protected _totalElement: HTMLElement | null = null;
    protected _itemsList: HTMLElement | null = null;
    protected _checkoutButton: HTMLElement | null = null;

    constructor(container: HTMLElement, actions: IBasketActions) {
        super(container);
        this._actions = actions;
    }

    set items(products: IProduct[]) {
        this._items = products;
        this.render();
    }

    get items(): IProduct[] {
        return this._items;
    }

    getTotal(): number {
        return this._items.reduce((sum, item) => sum + (item.price || 0), 0);
    }

    render(): HTMLElement {
        if (this._items.length === 0) {
            this.container.innerHTML = `
                <div class="basket__empty">Корзина пуста</div>
                <button class="button" disabled>Оформить</button>
                <div class="basket__total">0 синапсов</div>
            `;
            return this.container;
        }

        let itemsHTML = '';
        this._items.forEach((item, index) => {
            itemsHTML += `
                <div class="basket__item">
                    <span>${index + 1}</span>
                    <span>${item.title}</span>
                    <span>${item.price} синапсов</span>
                    <button class="basket__item-delete" data-id="${item.id}">
                        <span class="basket__delete-icon"></span>
                    </button>
                </div>
            `;
        });

        this.container.innerHTML = `
            <div class="basket__items">
                ${itemsHTML}
            </div>
            <button class="button">Оформить</button>
            <div class="basket__total">${this.getTotal()} синапсов</div>
        `;

        // Привязываю обработчики
        this._checkoutButton = this.container.querySelector('button');
        if (this._checkoutButton) {
            this._checkoutButton.addEventListener('click', () => this._actions.onCheckout());
        }

        const deleteButtons = this.container.querySelectorAll('.basket__item-delete');
        deleteButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
                const product = this._items.find(p => p.id === id);
                if (product) {
                    this._actions.onRemoveItem(product);
                }
            });
        });

        return this.container;
    }
}
