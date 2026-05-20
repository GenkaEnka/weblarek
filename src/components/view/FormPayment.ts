import { Form } from './Form';
import { TPayment } from '../../types/index';

export interface IFormPaymentActions {
    onSubmit: (data: { payment: TPayment; address: string }) => void;
}

export class FormPayment extends Form {
    protected _actions: IFormPaymentActions;
    protected _payment: TPayment = '';
    protected _address: string = '';

    constructor(container: HTMLElement, actions: IFormPaymentActions) {
        super(container);
        this._actions = actions;
        this.setupEventListeners();
    }

    protected setupEventListeners(): void {
        const buttons = this.container.querySelectorAll('.button_alt');
        buttons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                buttons.forEach(b => b.classList.remove('button_alt-active'));
                (e.currentTarget as HTMLElement).classList.add('button_alt-active');
                this._payment = (e.currentTarget as HTMLElement).getAttribute('data-payment') as TPayment;
            });
        });

        const addressInput = this.container.querySelector('input[name="address"]') as HTMLInputElement;
        if (addressInput) {
            addressInput.addEventListener('input', (e) => {
                this._address = (e.currentTarget as HTMLInputElement).value;
            });
        }

        if (this._submitButton) {
            this._submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                this._actions.onSubmit({
                    payment: this._payment,
                    address: this._address
                });
            });
        }
    }

    set data(data: { payment: TPayment; address: string }) {
        this._payment = data.payment;
        this._address = data.address;
        this.render();
    }

    render(): HTMLElement {
        this.renderErrors();
        return this.container;
    }
}
