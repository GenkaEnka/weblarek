import { Component } from '../base/Component';

export interface IOrderSuccessActions {
    onClose: () => void;
}

export class OrderSuccess extends Component<{ total: number }> {
    protected _actions: IOrderSuccessActions;
    protected _total: number = 0;

    constructor(container: HTMLElement, actions: IOrderSuccessActions) {
        super(container);
        this._actions = actions;
    }

    set total(value: number) {
        this._total = value;
    }

    render(): HTMLElement {
        const template = document.getElementById('success') as HTMLTemplateElement;
        const content = template.content.cloneNode(true) as HTMLElement;

        const description = content.querySelector('.order-success__description') as HTMLElement;
        if (description) {
            description.textContent = `Списано ${this._total} синапсов`;
        }

        const closeButton = content.querySelector('.order-success__close') as HTMLElement;
        if (closeButton) {
            closeButton.addEventListener('click', () => this._actions.onClose());
        }

        this.container.innerHTML = '';
        this.container.appendChild(content);

        return this.container;
    }
}
