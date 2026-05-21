import { Form } from '../base/Form';
import { IEvents } from '../base/Events';

export class ContactsForm extends Form {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set email(value: string) {
        (this.formElement.elements.namedItem('email') as HTMLInputElement).value = value;
    }

    set phone(value: string) {
        (this.formElement.elements.namedItem('phone') as HTMLInputElement).value = value;
    }
}