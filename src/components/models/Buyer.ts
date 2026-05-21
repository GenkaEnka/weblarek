import {TPayment} from '../../types/index.ts'
import {TBuyerErrors} from '../../types/index.ts'
import {IEvents} from '../base/events.ts'

export class Buyer {
    private _payment: TPayment;
    private _address: string;
    private _phone: string;
    private _email: string;
    
    constructor(protected events: IEvents) {
        this._payment = '';
        this._address = '';
        this._phone = '';
        this._email = '';
    }
    
    get payment(): TPayment {
        return this._payment;
    }

    set payment(val: TPayment) {
        this._payment = val;
        this.events.emit('buyer:changed', this.getBuyerData());
    }

    get address(): string {
        return this._address;
    }

    set address(val: string) {
        this._address = val;
        this.events.emit('buyer:changed', this.getBuyerData());
    }

    get phone(): string {
        return this._phone;
    }

    set phone(val: string) {
        this._phone = val;
        this.events.emit('buyer:changed', this.getBuyerData());
    }

    get email(): string {
        return this._email;
    }

    set email(val: string) {
        this._email = val;
        this.events.emit('buyer:changed', this.getBuyerData());
    }

    getBuyerData() {
        return {
            payment: this._payment,
            address: this._address,
            phone: this._phone,
            email: this._email
        };
    }

    cleanBuyerData(): void {
            this._payment = '';
            this._address = '';
            this._phone = '';
            this._email = '';
            this.events.emit('buyer:changed', this.getBuyerData());
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
