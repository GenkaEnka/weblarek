import './scss/styles.scss';

import {Buyer} from './components/models/Buyer';
import {Cart} from './components/models/Cart';
import {ProductCatalog} from './components/models/ProductCatalog';
import {ClientApi} from './components/services/ClientApi';
import {Api} from './components/base/Api';

import {apiProducts} from './utils/data';

import {IProduct} from './types/index.ts'
import {TGetResponse} from './types/index.ts'
import {TPostResponse} from './types/index.ts'
import {TPostRequest} from './types/index.ts'
import {API_URL} from './utils/constants.ts'

// ProductCatalog initialization
console.log('\n=== ProductCatalog Testing ===');

const productCatalog = new ProductCatalog();
console.log('Create ProductCatalog object: ', JSON.stringify(productCatalog, null, 2));

console.log('Get products list (initially empty): ', JSON.stringify(productCatalog.productsList, null, 2));

productCatalog.productsList = apiProducts.items;
console.log('Update products list: ', JSON.stringify(productCatalog.productsList, null, 2));

console.log('Successful product search by id: ', productCatalog.getProductByID('c101ab44-ed99-4a54-990d-47aa2bb4e7d9'));
console.log('Failed product search by id: ', productCatalog.getProductByID('124'));

console.log('Get focus card (initially null): ', productCatalog.focusCard);

productCatalog.focusCard = apiProducts.items[0];
console.log('Set focus card: ', productCatalog.focusCard);

// Buyer data initialization
console.log('\n=== Buyer Testing ===');

const buyer = new Buyer();
console.log('Create Buyer object: ', JSON.stringify(buyer, null, 2));

console.log('Get payment method: ', buyer.payment);

buyer.payment = 'cash';
console.log('Update payment method: ', buyer.payment);

console.log('Get address: ', buyer.address);

buyer.address = 'Mars';
console.log('Update address: ', buyer.address);

console.log('Get phone: ', buyer.phone);

buyer.phone = '555 55 55';
console.log('Update phone: ', buyer.phone);

console.log('Get email: ', buyer.email);

buyer.email = 'contact@example.com';
console.log('Update email: ', buyer.email);

console.log('Validation check - all fields valid: ', buyer.validation());

buyer.payment = '';
buyer.phone = '';
console.log('Validation check - payment and phone invalid: ', buyer.validation());

buyer.cleanBuyerData();
console.log('Clean buyer data: ', JSON.stringify(buyer, null, 2));

// Cart initialization
console.log('\n=== Cart Testing ===');

const cart = new Cart();
console.log('Create Cart object: ', JSON.stringify(cart, null, 2));

console.log('Get selected products list: ', JSON.stringify(cart.productsList, null, 2));

cart.addProduct(apiProducts.items[0]);
cart.addProduct(apiProducts.items[1]);
console.log('Add products to cart: ', JSON.stringify(cart.productsList, null, 2));

console.log('Calculate cart total: ', cart.getTotalCartPrice());

console.log('Get product count in cart: ', cart.getProductCountInCart());

cart.discardProduct(apiProducts.items[1]);
console.log('Remove product from cart: ', JSON.stringify(cart.productsList, null, 2));

cart.discardProduct(apiProducts.items[3]);
console.log('Try to remove non-existent product: ', JSON.stringify(cart.productsList, null, 2));

console.log('Successful product search by id: ', cart.isProductInCartById('c101ab44-ed99-4a54-990d-47aa2bb4e7d9'));
console.log('Failed product search by id: ', cart.isProductInCartById('854cef69-976d-4c2a-a18c-2aa45046c390'));

cart.cleanCart()
console.log('Clean cart: ', JSON.stringify(cart.productsList, null, 2));

// Server integration
console.log('\n=== ClientApi Testing ===');
const clientApi: ClientApi = new ClientApi(new Api(API_URL));

async function getRemoteCatalog() {
    try {
        const data: TGetResponse = await clientApi.getData();
        const productList: IProduct[] = data.items;
        console.log('Catalog from server: ', JSON.stringify(productList, null, 2));
    }
    catch(error){
        console.log('Failed to get catalog from server', error);
    }
}

getRemoteCatalog();

// Test order submission
console.log('\n=== POST Request Testing ===');
const buyer2 = new Buyer();
buyer2.payment = 'cash';
buyer2.address = 'Земля';
buyer2.phone = '555 55 55';
buyer2.email = 'ganja@mail.ru';

const cart2 = new Cart();
cart2.addProduct(apiProducts.items[0]);
cart2.addProduct(apiProducts.items[1]);

const request: TPostRequest = ({
    payment: buyer2.payment,
    email: buyer2.email,
    phone: buyer2.phone,
    address: buyer2.address,
    total: cart2.getTotalCartPrice(),
    items: [
        apiProducts.items[0].id,
        apiProducts.items[1].id
    ]
})

async function setDataToServer() {
    try {
        const postResponse: TPostResponse = await clientApi.setData(request);
        console.log('Server response to POST request: ', JSON.stringify(postResponse, null, 2));
    }
    catch(error){
        console.log('Failed to send data to server', error);
    }
}

setDataToServer();
