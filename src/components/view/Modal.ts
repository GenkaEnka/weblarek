import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class Modal extends Component<{}> {
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this._content = ensureElement<HTMLElement>('.modal__content', container);

        this._closeButton.addEventListener('click', () => {
            this.close();
            this.events.emit('modal:close');
        });

        this.container.addEventListener('click', (e: MouseEvent) => {
            if (e.target === this.container) {
                this.close();
                this.events.emit('modal:close');
            }
        });

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
                this.events.emit('modal:close');
            }
        });
    }

    private isOpen(): boolean {
        return this.container.classList.contains('modal_active');
    }

    open() {
        this.container.classList.add('modal_active');
    }

    close() {
        this.container.classList.remove('modal_active');
        this._content.innerHTML = '';
    }

    set content(value: HTMLElement) {
        this._content.innerHTML = '';
        this._content.appendChild(value);
    }

    render(data?: { content: HTMLElement }): HTMLElement {
        if (data?.content) {
            this.content = data.content;
        }
        this.open();
        return this.container;
    }
}