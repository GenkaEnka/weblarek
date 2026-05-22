import { Card } from '../base/Card';
import { IProduct } from '../../types/index';

export class CardBasket extends Card {
    protected _index: HTMLElement;
    private _onDelete: (id: string) => void;

    constructor(container: HTMLElement, onDelete: (id: string) => void) {
        super(container);
        this._index = container.querySelector('.basket__item-index') as HTMLElement;
        this._onDelete = onDelete;
    }

    set index(value: number) {
        this._index.textContent = String(value);
    }

    render(data?: Partial<IProduct>): HTMLElement {
        super.render(data);
        if (data && data.id) {
            const id = data.id;
            const deleteButton = this.container.querySelector('.basket__item-delete') as HTMLButtonElement;
            if (deleteButton) {
                deleteButton.onclick = () => {
                    this._onDelete(id);
                };
            }
        }
        return this.container;
    }
}