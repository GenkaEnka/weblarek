import { Component } from '../base/Component';
import { IProduct } from '../../types/index';
import { CDN_URL, categoryMap } from '../../utils/constants';

export interface ICardFullActions {
    onBuy: (product: IProduct) => void;
    onRemove: (product: IProduct) => void;
}

export class CardFull extends Component<IProduct> {
    protected _product: IProduct;
    protected _actions: ICardFullActions;
    protected _inCart: boolean = false;

    constructor(container: HTMLElement, actions: ICardFullActions) {
        super(container);
        this._actions = actions;
        this._product = {} as IProduct;
    }

    set product(product: IProduct) {
        this._product = product;
    }

    set inCart(value: boolean) {
        this._inCart = value;
    }

    get product(): IProduct {
        return this._product;
    }

    render(): HTMLElement {
        console.log('CardFull.render() called with product:', this._product);
        const buttonText = this._inCart ? 'Удалить из корзины' : 
                          (this._product.price === null ? 'Недоступно' : 'Купить');
        const buttonDisabled = this._product.price === null;

        this.container.innerHTML = `
            <div class="card card_full">
                <img class="card__image" src="${CDN_URL}/${this._product.image}" alt="${this._product.title}">
                <div class="card__column">
                    <div class="card__category card__category_${
                        categoryMap[this._product.category as keyof typeof categoryMap] || 'other'
                    }">
                        ${this._product.category}
                    </div>
                    <h2 class="card__title">${this._product.title}</h2>
                    <p class="card__text">${this._product.description}</p>
                    <div class="card__row">
                        <button 
                            class="button ${buttonDisabled ? 'button_disabled' : ''}"
                            ${buttonDisabled ? 'disabled' : ''}
                        >
                            ${buttonText}
                        </button>
                        <span class="card__price">${this._product.price} синапсов</span>
                    </div>
                </div>
            </div>
        `;

        const button = this.container.querySelector('button') as HTMLElement;
        if (!buttonDisabled) {
            button.addEventListener('click', () => {
                if (this._inCart) {
                    this._actions.onRemove(this._product);
                } else {
                    this._actions.onBuy(this._product);
                }
            });
        }

        return this.container;
    }
}
