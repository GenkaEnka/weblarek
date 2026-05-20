import { Component } from '../base/Component';
import { FormErrors } from '../../types/index';

export abstract class Form extends Component<FormErrors> {
    protected _submitButton: HTMLElement | null = null;
    protected _errors: FormErrors = {};

    constructor(container: HTMLElement) {
        super(container);
        this._submitButton = this.container.querySelector('button[type="submit"]') as HTMLElement;
    }

    set errors(errors: FormErrors) {
        this._errors = errors;
        this.render();
    }

    protected renderErrors(): void {
        const errorElements = this.container.querySelectorAll('.form__error');
        errorElements.forEach((el) => el.remove());

        Object.entries(this._errors).forEach(([field, message]) => {
            const input = this.container.querySelector(`[name="${field}"]`) as HTMLElement;
            if (input && message) {
                const error = document.createElement('span');
                error.className = 'form__error';
                error.textContent = message;
                input.insertAdjacentElement('afterend', error);
            }
        });

        const isValid = Object.keys(this._errors).length === 0;
        if (this._submitButton) {
            if (isValid) {
                this._submitButton.classList.remove('button_disabled');
                this._submitButton.removeAttribute('disabled');
            } else {
                this._submitButton.classList.add('button_disabled');
                this._submitButton.setAttribute('disabled', 'disabled');
            }
        }
    }

    abstract render(): HTMLElement;
}
