import { Component } from '../base/Component';

export interface IModalActions {
    onClose: () => void;
}

export class Modal extends Component<HTMLElement> {
    protected _closeButton: HTMLElement;
    protected _actions: IModalActions;
    protected _content: HTMLElement;
    public onClose: (() => void) | null = null;

    constructor(container: HTMLElement, actions: IModalActions) {
        super(container);
        this._actions = actions;
        this._closeButton = this.container.querySelector('.modal__close') as HTMLElement;
        this._content = this.container.querySelector('.modal__content') as HTMLElement;

        this._closeButton?.addEventListener('click', () => this.handleClose());
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.handleClose();
            }
        });
    }

    protected handleClose(): void {
        if (this.onClose) {
            this.onClose();
        }
        this._actions.onClose();
    }

    set content(element: HTMLElement) {
        // Copy the element's content instead of appending to avoid layout issues
        this._content.innerHTML = element.innerHTML;
    }

    open(): void {
        this.container.classList.add('modal_active');
    }

    close(): void {
        this.container.classList.remove('modal_active');
    }

    render(): HTMLElement {
        return this.container;
    }
}
