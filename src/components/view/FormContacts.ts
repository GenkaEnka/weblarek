import { Form } from './Form';

export interface IFormContactsActions {
    onSubmit: (data: { email: string; phone: string }) => void;
}

export class FormContacts extends Form {
    protected _actions: IFormContactsActions;
    protected _email: string = '';
    protected _phone: string = '';

    constructor(container: HTMLElement, actions: IFormContactsActions) {
        super(container);
        this._actions = actions;
        this.setupEventListeners();
    }

    protected setupEventListeners(): void {
        const emailInput = this.container.querySelector('input[name="email"]') as HTMLInputElement;
        const phoneInput = this.container.querySelector('input[name="phone"]') as HTMLInputElement;

        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                this._email = (e.currentTarget as HTMLInputElement).value;
            });
        }

        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this._phone = (e.currentTarget as HTMLInputElement).value;
            });
        }

        if (this._submitButton) {
            this._submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                this._actions.onSubmit({
                    email: this._email,
                    phone: this._phone
                });
            });
        }
    }

    set data(data: { email: string; phone: string }) {
        this._email = data.email;
        this._phone = data.phone;
        this.render();
    }

    render(): HTMLElement {
        this.renderErrors();
        return this.container;
    }
}
