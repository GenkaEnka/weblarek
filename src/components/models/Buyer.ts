import {TPayment} from '../../types/index.ts'
import {IEvents} from '../base/Events'
import {TBuyerErrors} from '../../types/index.ts'

export class Buyer {
    private _payment: TPayment;
    private _address: string;
    private _phone: string;
    private _email: string;
    private _events: IEvents;
    
    constructor(events: IEvents) {
        this._payment = '';
        this._address = '';
        this._phone = '';
        this._email = '';
        this._events = events;
    }
    
    get payment(): TPayment {
        return this._payment;
    }

    set payment(val: TPayment) {
        this._payment = val;
        this._events.emit('buyer:changed');
    }

    get address(): string {
        return this._address;
    }

    set address(val: string) {
        this._address = val;
        this._events.emit('buyer:changed');
    }

    get phone(): string {
        return this._phone;
    }

    set phone(val: string) {
        this._phone = val;
        this._events.emit('buyer:changed');
    }

    get email(): string {
        return this._email;
    }

    set email(val: string) {
        this._email = val;
        this._events.emit('buyer:changed');
    }

    cleanBuyerData(): void {
            this._payment = '';
            this._address = '';
            this._phone = '';
            this._email = '';
            this._events.emit('buyer:changed');
    }

    validation(): TBuyerErrors {
        const result : TBuyerErrors = {};

        if( this._payment === '') {
            result['payment'] = 'Не выбран вид оплаты';
        }

        if(  this._address === '') {
            result['address'] = 'Укажите адрес';
        }

        if( this._phone === '') {
            result['phone'] = 'Укажите телефон';
        }

        if( this._email === '') {
            result['email'] = 'Укажите электронную почту';
        }

        return result;
    }
}