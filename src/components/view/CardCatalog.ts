import { Card } from '../base/Card';
import { IEvents } from '../base/events';

export class CardCatalog extends Card {
    constructor(container: HTMLElement, events?: IEvents) {
        super(container, events);

        container.addEventListener('click', () => {
            this.events?.emit('card:select', { id: this.id });
        });
    }
}