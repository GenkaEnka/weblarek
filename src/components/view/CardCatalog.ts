import { CardDetailed } from '../base/CardDetailed';
import { IProduct } from '../../types/index';

export class CardCatalog extends CardDetailed {
    private _onClick: (id: string) => void;

    constructor(container: HTMLElement, onClick: (id: string) => void) {
        super(container);
        this._onClick = onClick;
    }

    render(data?: Partial<IProduct>): HTMLElement {
        super.render(data);
        if (data && data.id) {
            const id = data.id;
            this.container.onclick = () => {
                this._onClick(id);
            };
        }
        return this.container;
    }
}