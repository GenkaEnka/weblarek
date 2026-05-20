import {IProduct} from '../../types/index.ts'
import {IEvents} from '../base/Events'

export class Cart {
    private _productsList: IProduct[];
    private _events: IEvents;

    constructor(events: IEvents) {
        this._productsList = [];
        this._events = events;
    }

    get productsList(): IProduct[] {
        return this._productsList;
    }

    addProduct(product: IProduct): void {
        this._productsList.push(product);
        this._events.emit('cart:changed');
    }

    discardProduct(product: IProduct): void {
        if(this.isProductInCartById(product.id)) {
            const index = this._productsList.indexOf(product); 
            this._productsList.splice(index, 1);
            this._events.emit('cart:changed');
        }
    }

    cleanCart(): void {
        this._productsList = [];
        this._events.emit('cart:changed');
    }

    getTotalCartPrice(): number {
        return this._productsList.reduce((total, item) => total + (item.price || 0), 0);
    }

    getProductCountInCart(): number {
        return this._productsList.length;
    }

    isProductInCartById(id: string): boolean {
        return this._productsList.some(item => item.id === id);

    }
}