import { CardDetailed } from '../base/CardDetailed';
import { IEvents } from '../base/events';
import { IProduct } from '../../types/index';

export class CardPreview extends CardDetailed {
    private _onToggle: () => void;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);
        this._onToggle = () => {
            this.events?.emit('card:previewToggle');
        };
        if (this._button) {
            this._button.onclick = this._onToggle;
        }
    }

    set buttonText(value: string) {
        if (this._button) {
            this._button.textContent = value;
        }
    }

    set buttonDisabled(value: boolean) {
        if (this._button) {
            this._button.disabled = value;
        }
    }

    render(data?: Partial<IProduct>): HTMLElement {
        super.render(data);
        return this.container;
    }
}