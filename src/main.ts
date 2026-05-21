import './scss/styles.scss';

import { EventEmitter, IEvents } from './components/base/events';
import { ProductCatalog } from './components/models/ProductCatalog';
import { Cart } from './components/models/Cart';
import { Buyer } from './components/models/Buyer';
import { ClientApi } from './components/services/ClientApi';
import { Api } from './components/base/Api';

import { API_URL } from './utils/constants';
import { cloneTemplate } from './utils/utils';

import { IProduct, TPayment, TGetResponse, TPostResponse, TPostRequest } from './types/index';

import { Page } from './components/view/Page';
import { Modal } from './components/view/Modal';
import { Basket } from './components/view/Basket';
import { CardCatalog } from './components/view/CardCatalog';
import { CardPreview } from './components/view/CardPreview';
import { CardBasket } from './components/view/CardBasket';
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { Success } from './components/view/Success';

const events: IEvents = new EventEmitter();

const productCatalog = new ProductCatalog(events);
const cart = new Cart(events);
const buyer = new Buyer(events);

const api = new ClientApi(new Api(API_URL));

const page = new Page(document.body, events);
const modal = new Modal(document.getElementById('modal-container') as HTMLElement, events);
const basket = new Basket(document.getElementById('basket') as HTMLTemplateElement, events);

const cardCatalogTemplate = document.getElementById('card-catalog') as HTMLTemplateElement;
const cardPreviewTemplate = document.getElementById('card-preview') as HTMLTemplateElement;
const cardBasketTemplate = document.getElementById('card-basket') as HTMLTemplateElement;

const orderTemplate = document.getElementById('order') as HTMLTemplateElement;
const contactsTemplate = document.getElementById('contacts') as HTMLTemplateElement;

let currentOrderForm: OrderForm | null = null;
let currentContactsForm: ContactsForm | null = null;

function validateOrderForm() {
    const errors = buyer.validation();
    const hasPaymentError = !!errors.payment;
    const hasAddressError = !!errors.address;

    if (currentOrderForm) {
        currentOrderForm.valid = !hasPaymentError && !hasAddressError;

        const errorMessages: string[] = [];
        if (hasPaymentError) errorMessages.push(errors.payment!);
        if (hasAddressError) errorMessages.push(errors.address!);
        currentOrderForm.errors = errorMessages;
    }
}

function validateContactsForm() {
    const errors = buyer.validation();
    const hasEmailError = !!errors.email;
    const hasPhoneError = !!errors.phone;

    if (currentContactsForm) {
        currentContactsForm.valid = !hasEmailError && !hasPhoneError;

        const errorMessages: string[] = [];
        if (hasEmailError) errorMessages.push(errors.email!);
        if (hasPhoneError) errorMessages.push(errors.phone!);
        currentContactsForm.errors = errorMessages;
    }
}

function updateBasketView() {
    const products = cart.productsList;
    const cardElements = products.map((product, index) => {
        const cardElement = cloneTemplate<HTMLElement>(cardBasketTemplate);
        const card = new CardBasket(cardElement, events);
        card.render({
            id: product.id,
            title: product.title,
            price: product.price
        });
        card.index = index + 1;
        return cardElement;
    });

    basket.items = cardElements;
    basket.total = cart.getTotalCartPrice();
    basket.valid = products.length > 0;
}

async function fetchCatalog() {
    try {
        const data: TGetResponse = await api.getData();
        productCatalog.productsList = data.items;
    } catch (error) {
        console.error('Failed to load catalog:', error);
    }
}

events.on('cards:changed', (data: { products: IProduct[] }) => {
    const cardElements = data.products.map((product) => {
        const cardElement = cloneTemplate<HTMLElement>(cardCatalogTemplate);
        const card = new CardCatalog(cardElement, events);
        card.render(product);
        return cardElement;
    });
    page.gallery = cardElements;
});

events.on('card:select', (data: { id: string }) => {
    const product = productCatalog.getProductByID(data.id);
    if (product) {
        productCatalog.focusCard = product;
    }
});

events.on('preview:changed', (data: { product: IProduct | null }) => {
    if (!data.product) return;

    const previewElement = cloneTemplate<HTMLElement>(cardPreviewTemplate);
    const preview = new CardPreview(previewElement, events);
    preview.render(data.product);

    if (cart.isProductInCartById(data.product.id)) {
        preview.inCart = true;
    } else {
        preview.inCart = false;
    }

    page.locked = true;
    modal.render({ content: previewElement });
});

events.on('card:toBasket', (data: { id: string }) => {
    const product = productCatalog.getProductByID(data.id);
    if (product && !cart.isProductInCartById(data.id)) {
        cart.addProduct(product);
    }
    modal.close();
    productCatalog.focusCard = null;
});

events.on('card:deleteFromBasket', (data: { id: string }) => {
    const product = productCatalog.getProductByID(data.id);
    if (product) {
        cart.discardProduct(product);
    }
    productCatalog.focusCard = null;
    modal.close();
});

events.on('basket:changed', () => {
    page.counter = cart.getProductCountInCart();
});

events.on('basket:delete', (data: { id: string }) => {
    const product = productCatalog.getProductByID(data.id);
    if (product) {
        cart.discardProduct(product);
    }
    updateBasketView();
});

events.on('basket:open', () => {
    updateBasketView();
    page.locked = true;
    modal.render({ content: basket.render() });
});

events.on('order:open', () => {
    const orderElement = cloneTemplate<HTMLFormElement>(orderTemplate);
    currentOrderForm = new OrderForm(orderElement, events);

    if (buyer.payment) {
        currentOrderForm.payment = buyer.payment;
    }
    if (buyer.address) {
        currentOrderForm.address = buyer.address;
    }

    validateOrderForm();
    page.locked = true;
    modal.render({ content: orderElement });
});

events.on('payment:change', (data: { payment: TPayment }) => {
    buyer.payment = data.payment;
    validateOrderForm();
});

events.on('orderInput:change', (data: { field: string; value: string }) => {
    if (data.field === 'address') {
        buyer.address = data.value;
    }
    validateOrderForm();
});

events.on('order:submit', () => {
    const errors = buyer.validation();
    if (errors.payment || errors.address) return;

    const contactsElement = cloneTemplate<HTMLFormElement>(contactsTemplate);
    currentContactsForm = new ContactsForm(contactsElement, events);

    if (buyer.email) {
        currentContactsForm.email = buyer.email;
    }
    if (buyer.phone) {
        currentContactsForm.phone = buyer.phone;
    }

    validateContactsForm();
    page.locked = true;
    modal.render({ content: contactsElement });
});

events.on('contactsInput:change', (data: { field: string; value: string }) => {
    if (data.field === 'email') {
        buyer.email = data.value;
    } else if (data.field === 'phone') {
        buyer.phone = data.value;
    }
    validateContactsForm();
});

events.on('contacts:submit', () => {
    const errors = buyer.validation();
    if (errors.email || errors.phone) return;

    const request: TPostRequest = {
        payment: buyer.payment,
        email: buyer.email,
        phone: buyer.phone,
        address: buyer.address,
        total: cart.getTotalCartPrice(),
        items: cart.productsList.map(product => product.id)
    };

    api.setData(request)
        .then((response: TPostResponse) => {
            cart.cleanCart();
            buyer.cleanBuyerData();
            currentOrderForm = null;
            currentContactsForm = null;

            const successComponent = new Success(
                document.getElementById('success') as HTMLTemplateElement,
                events
            );
            successComponent.total = response.total;
            page.locked = true;
            modal.render({ content: successComponent.render() });
        })
        .catch((error) => {
            console.error('Failed to submit order:', error);
        });
});

events.on('modal:close', () => {
    modal.close();
    page.locked = false;
    currentOrderForm = null;
    currentContactsForm = null;
});

fetchCatalog();