import { Form } from '../base/Form';
import { IEvents } from '../base/events';
import { TPayment } from '../../types/index';
import { ensureElement } from '../../utils/utils';

export class OrderForm extends Form {
    protected _cardButton: HTMLButtonElement;
    protected _cashButton: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', container);
        this._cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', container);

        this._cardButton.addEventListener('click', () => {
            this.events.emit('payment:change', { payment: 'card' as TPayment });
        });

        this._cashButton.addEventListener('click', () => {
            this.events.emit('payment:change', { payment: 'cash' as TPayment });
        });
    }

    set payment(value: TPayment) {
        this._cardButton.classList.remove('button_alt-active');
        this._cashButton.classList.remove('button_alt-active');
        if (value === 'card') {
            this._cardButton.classList.add('button_alt-active');
        } else {
            this._cashButton.classList.add('button_alt-active');
        }
    }

    set address(value: string) {
        (this.formElement.elements.namedItem('address') as HTMLInputElement).value = value;
    }
}