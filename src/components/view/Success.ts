import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement, cloneTemplate } from '../../utils/utils';

export class Success extends Component<{}> {
    protected _closeButton: HTMLButtonElement;
    protected _description: HTMLElement;

    constructor(template: HTMLTemplateElement, protected events: IEvents) {
        const container = cloneTemplate<HTMLElement>(template);
        super(container);
        this._closeButton = ensureElement<HTMLButtonElement>('.order-success__close', container);
        this._description = ensureElement<HTMLElement>('.order-success__description', container);

        this._closeButton.addEventListener('click', () => {
            this.events.emit('modal:close');
        });
    }

    set total(value: number) {
        this._description.textContent = `Списано ${value} синапсов`;
    }

    render(): HTMLElement {
        return this.container;
    }
}