import {IProduct} from '../../types/index.ts'

export class Cart {
    private _productsList: IProduct[];

    constructor() {
        this._productsList = []
    }

    get productsList(): IProduct[] {
        return this._productsList;
    }

    addProduct(product: IProduct): void {
        this._productsList.push(product);
    }

    discardProduct(product: IProduct): void {
        if(this.isProductInCartById(product.id)) {
            const index = this._productsList.indexOf(product); 
            this._productsList.splice(index, 1);
        }
    }

    cleanCart(): void {
        this._productsList = []
    }

    getTotalCartPrice(): number {
        return this._productsList.reduce((total, item) => total + (item.price || 0), 0);
    }

    getProductCountInCart(): number {
        return this._productsList.length;
    }

    isProductInCartById(id: string): boolean {
        return this._productsList.some( item => {
            return item.id === id ? true : false;
        });

    }
}