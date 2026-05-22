import { Card } from './Card';
import { IEvents } from './events';
import { IProduct } from '../../types/index';
import { CDN_URL, categoryMap } from '../../utils/constants';

export class CardDetailed extends Card {
    protected _image?: HTMLImageElement;
    protected _category?: HTMLElement;
    protected _button?: HTMLButtonElement;
    protected _description?: HTMLElement;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container, events);
        this._image = container.querySelector('.card__image') || undefined;
        this._category = container.querySelector('.card__category') || undefined;
        this._button = container.querySelector('.card__button') || undefined;
        this._description = container.querySelector('.card__text') || undefined;
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

    set description(value: string) {
        if (this._description) {
            this._description.textContent = value;
        }
    }

    private getCategoryClass(category: string): string {
        return categoryMap[category as keyof typeof categoryMap] || 'card__category_other';
    }

    render(data?: Partial<IProduct>): HTMLElement {
        super.render(data);
        if (data) {
            if (data.image) this.image = data.image;
            if (data.category) this.category = data.category;
            if (data.description) this.description = data.description;
        }
        return this.container;
    }
}