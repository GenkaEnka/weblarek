import {IProduct} from '../../types/index.ts'

export class ProductCatalog {
    private _productsList: IProduct[];
    private _focusCard: IProduct | null;

    constructor() {
        this._productsList = [];
        this._focusCard = null;
    }

    get productsList(): IProduct[] {
        return this._productsList;
    }

    set productsList(productsList: IProduct[]) {
        this._productsList = productsList;
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
    }
}