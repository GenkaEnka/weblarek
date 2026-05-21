import {IProduct} from '../../types/index.ts'
import {IEvents} from '../base/Events.ts'

export class ProductCatalog {
    private _productsList: IProduct[];
    private _focusCard: IProduct | null;

    constructor(protected events: IEvents) {
        this._productsList = [];
        this._focusCard = null;
    }

    get productsList(): IProduct[] {
        return this._productsList;
    }

    set productsList(productsList: IProduct[]) {
        this._productsList = productsList;
        this.events.emit('cards:changed', { products: this._productsList });
    }

    getProductByID(id: string): IProduct | null {
        const result = this._productsList.find( item => item.id === id);
        return  result || null;
    }

    get focusCard(): IProduct | null {
        return this._focusCard;
    }

    set focusCard(product: IProduct | null) {
        this._focusCard = product;
        this.events.emit('preview:changed', { product });
    }
}
