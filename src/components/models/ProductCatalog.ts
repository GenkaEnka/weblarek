import {IProduct} from '../../types/index.ts'
import {IEvents} from '../base/Events'

export class ProductCatalog {
    private _productsList: IProduct[];
    private _focusCard: IProduct | null;
    private _events: IEvents;

    constructor(events: IEvents) {
        this._productsList = [];
        this._focusCard = null;
        this._events = events;
    }

    get productsList(): IProduct[] {
        return this._productsList;
    }

    set productsList(productsList: IProduct[]) {
        this._productsList = productsList;
        this._events.emit('products:changed');
    }

    getProductByID(id: string): IProduct | null {
        const result = this._productsList.find( item => item.id === id);
        return  result || null;
    }

    get focusCard(): IProduct | null {
        return this._focusCard;
    }

    set focusCard(product: IProduct) {
        this._focusCard = product;
        this._events.emit('card:open', product);
    }
}