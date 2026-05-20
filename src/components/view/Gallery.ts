import { Component } from '../base/Component';
import { IProduct } from '../../types/index';
import { Card } from './Card';

export interface IGalleryActions {
    onClick: (product: IProduct) => void;
}

export class Gallery extends Component<IProduct[]> {
    protected _gallery: IProduct[] = [];
    protected _cardActions: IGalleryActions;

    constructor(container: HTMLElement, cardActions: IGalleryActions) {
        super(container);
        this._cardActions = cardActions;
    }

    set gallery(items: IProduct[]) {
        this._gallery = items;
        this.render();
    }

    setActions(actions: IGalleryActions): void {
        this._cardActions = actions;
    }

    render(): HTMLElement {
        this.container.innerHTML = '';
        
        this._gallery.forEach((product) => {
            const cardContainer = document.createElement('div');
            cardContainer.className = 'gallery__item';
            const card = new Card(cardContainer, this._cardActions as any);
            card.render({ ...product });
            this.container.appendChild(cardContainer);
        });

        return this.container;
    }
}
