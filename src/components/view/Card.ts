import { Component } from '../base/Component';
import { IProduct } from '../../types/index';
import { CDN_URL, categoryMap } from '../../utils/constants';

export interface ICardActions {
    onClick: (product: IProduct) => void;
}

export class Card extends Component<IProduct> {
    protected _product: IProduct;
    protected _actions: ICardActions;

    constructor(container: HTMLElement, actions: ICardActions) {
        super(container);
        this._actions = actions;
        this._product = {} as IProduct;
    }

    set product(product: IProduct) {
        this._product = product;
    }

    get product(): IProduct {
        return this._product;
    }

    render(data?: Partial<IProduct>): HTMLElement {
        if (data) {
            this._product = { ...this._product, ...data };
        }

        this.container.innerHTML = `
            <div class="card">
                <div class="card__content">
                    <div class="card__category card__category_${
                        categoryMap[this._product.category as keyof typeof categoryMap] || 'other'
                    }">
                        ${this._product.category}
                    </div>
                    <h3 class="card__title">${this._product.title}</h3>
                    <img class="card__image" src="${CDN_URL}/${this._product.image}" alt="${this._product.title}">
                    <p class="card__price">${this._product.price} синапсов</p>
                </div>
            </div>
        `;

        this.container.addEventListener('click', () => {
            this._actions.onClick(this._product);
        });

        return this.container;
    }
}
