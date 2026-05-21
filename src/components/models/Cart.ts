import {IProduct} from '../../types/index.ts'
import {IEvents} from '../base/events.ts'

export class Cart {
    private _productsList: IProduct[];

    constructor(protected events: IEvents) {
        this._productsList = []
    }

    get productsList(): IProduct[] {
        return this._productsList;
    }

    addProduct(product: IProduct): void {
        this._productsList.push(product);
        this.events.emit('basket:changed', { products: this._productsList });
    }

    discardProduct(product: IProduct): void {
        const index = this._productsList.findIndex(item => item.id === product.id);
        if (index !== -1) {
            this._productsList.splice(index, 1);
            this.events.emit('basket:changed', { products: this._productsList });
        }
    }

    cleanCart(): void {
        this._productsList = []
        this.events.emit('basket:changed', { products: this._productsList });
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
