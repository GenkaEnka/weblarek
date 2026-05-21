import { IEvents } from './events';

export class Form {
    protected _form: HTMLFormElement;
    protected _errors: HTMLElement;
    protected _submit: HTMLButtonElement;
    protected events: IEvents;
    public formElement: HTMLFormElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        this.events = events;
        this._form = container;
        this.formElement = container;
        this._errors = container.querySelector('.form__errors') as HTMLElement;
        this._submit = container.querySelector('.modal__actions .button') as HTMLButtonElement;

        this._form.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(`${this._form.name}:submit`);
        });

        this._form.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const field = target.name;
            const value = target.value;
            this.events.emit(`${this._form.name}Input:change`, {
                field,
                value
            });
        });
    }

    set valid(isValid: boolean) {
        this._submit.disabled = !isValid;
    }

    set errors(errors: string[]) {
        this._errors.textContent = errors.join(', ');
    }

    render() {
        return this._form;
    }
}