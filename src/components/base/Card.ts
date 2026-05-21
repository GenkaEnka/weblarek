import { Component } from './Component';
import { IEvents } from './events';
import { IProduct } from '../../types/index';
import { ensureElement } from '../../utils/utils';
import { CDN_URL, categoryMap } from '../../utils/constants';

export class Card extends Component<IProduct> {
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _category?: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(container: HTMLElement, protected events?: IEvents) {
        super(container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._image = container.querySelector('.card__image') || undefined;
        this._category = container.querySelector('.card__category') || undefined;
        this._button = container.querySelector('.card__button') || undefined;
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this._title.textContent = value;
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set price(value: number | null) {
        if (value === null) {
            this._price.textContent = 'Бесценно';
            if (this._button) {
                this._button.disabled = true;
            }
        } else {
            this._price.textContent = `${value} синапсов`;
        }
    }

    get price(): number | null {
        const text = this._price.textContent || '';
        if (text === 'Бесценно') return null;
        return parseInt(text) || 0;
    }

    set image(value: string) {
        if (this._image) {
            this._image.src = `${CDN_URL}${value}`;
        }
    }

    set category(value: string) {
        if (this._category) {
            this._category.textContent = value;
            const categoryClass = this.getCategoryClass(value);
            this._category.className = `card__category ${categoryClass}`;
        }
    }

    private getCategoryClass(category: string): string {
        return categoryMap[category as keyof typeof categoryMap] || 'card__category_other';
    }

    set description(value: string) {
        const descElement = this.container.querySelector('.card__text');
        if (descElement) {
            descElement.textContent = value;
        }
    }

    render(data?: Partial<IProduct>): HTMLElement {
        if (data) {
            if (data.id) this.id = data.id;
            if (data.title) this.title = data.title;
            if (data.price !== undefined) this.price = data.price;
            if (data.image) this.image = data.image;
            if (data.category) this.category = data.category;
            if (data.description) this.description = data.description;
        }
        return this.container;
    }
}