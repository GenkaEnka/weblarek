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

import { Header } from './components/view/Header';
import { Gallery } from './components/view/Gallery';
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

// page wrapper for locking scroll
const pageWrapper = document.querySelector('.page__wrapper') as HTMLElement;

// views: header and gallery are separate page-level views
const header = new Header(document.body, events);
const gallery = new Gallery(document.body, events);
const modal = new Modal(document.getElementById('modal-container') as HTMLElement, events);
const basket = new Basket(document.getElementById('basket') as HTMLTemplateElement, events);

const cardCatalogTemplate = document.getElementById('card-catalog') as HTMLTemplateElement;
const cardPreviewTemplate = document.getElementById('card-preview') as HTMLTemplateElement;
const cardBasketTemplate = document.getElementById('card-basket') as HTMLTemplateElement;

const orderTemplate = document.getElementById('order') as HTMLTemplateElement;
const contactsTemplate = document.getElementById('contacts') as HTMLTemplateElement;

// views created once and reused (except gallery and basket cards)
const previewElement = cloneTemplate<HTMLElement>(cardPreviewTemplate);
const preview = new CardPreview(previewElement, events);

const orderElement = cloneTemplate<HTMLFormElement>(orderTemplate);
const orderForm = new OrderForm(orderElement, events);

const contactsElement = cloneTemplate<HTMLFormElement>(contactsTemplate);
const contactsForm = new ContactsForm(contactsElement, events);

// page locking via modal events
events.on('modal:open', () => {
    pageWrapper.classList.add('page__wrapper_locked');
});

events.on('modal:close', () => {
    pageWrapper.classList.remove('page__wrapper_locked');
});

async function fetchCatalog() {
    try {
        const data: TGetResponse = await api.getData();
        productCatalog.productsList = data.items;
    } catch (error) {
        console.error('Failed to load catalog:', error);
    }
}

// catalog changed -> rebuild gallery (per-item card views are OK)
events.on('cards:changed', (data: { products: IProduct[] }) => {
    const cardElements = data.products.map((product) => {
        const cardElement = cloneTemplate<HTMLElement>(cardCatalogTemplate);
        const card = new CardCatalog(cardElement, (id: string) => {
            events.emit('card:select', { id });
        });
        card.render(product);
        return cardElement;
    });
    gallery.items = cardElements;
});

// card selected -> set focus in model, which triggers preview:changed
events.on('card:select', (data: { id: string }) => {
    const product = productCatalog.getProductByID(data.id);
    if (product) {
        productCatalog.focusCard = product;
    }
});

// preview changed -> render preview with correct button state
events.on('preview:changed', (data: { product: IProduct | null }) => {
    if (!data.product) return;
    preview.render(data.product);

    const inCart = cart.isProductInCartById(data.product.id);
    preview.buttonText = inCart ? 'Удалить из корзины' : 'Купить';
    preview.buttonDisabled = data.product.price === null;

    modal.render({ content: previewElement });
});

// preview toggle (no data in event - get current focus from model)
events.on('card:previewToggle', () => {
    const product = productCatalog.focusCard;
    if (!product) return;

    if (cart.isProductInCartById(product.id)) {
        cart.discardProduct(product);
    } else {
        cart.addProduct(product);
    }
    modal.close();
    productCatalog.focusCard = null;
});

// basket model changed -> update basket view + header counter
events.on('basket:changed', () => {
    const products = cart.productsList;
    const cardElements = products.map((product, index) => {
        const cardElement = cloneTemplate<HTMLElement>(cardBasketTemplate);
        const card = new CardBasket(cardElement, (id: string) => {
            const p = productCatalog.getProductByID(id);
            if (p) cart.discardProduct(p);
        });
        card.render({
            id: product.id,
            title: product.title,
            price: product.price,
        });
        card.index = index + 1;
        return cardElement;
    });

    basket.items = cardElements;
    basket.total = cart.getTotalCartPrice();
    basket.valid = products.length > 0;
    header.counter = cart.getProductCountInCart();
});

// basket:open -> just show modal with rendered basket
events.on('basket:open', () => {
    modal.render({ content: basket.render() });
});

// order:open -> just show modal with order form
events.on('order:open', () => {
    modal.render({ content: orderForm.render() });
});

// payment button clicked -> update model
events.on('payment:change', (data: { payment: TPayment }) => {
    buyer.payment = data.payment;
});

// input events -> update model
events.on('orderInput:change', (data: { field: string; value: string }) => {
    if (data.field === 'address') {
        buyer.address = data.value;
    }
});

events.on('contactsInput:change', (data: { field: string; value: string }) => {
    if (data.field === 'email') {
        buyer.email = data.value;
    } else if (data.field === 'phone') {
        buyer.phone = data.value;
    }
});

// buyer model changed -> update all form fields and validation
events.on('buyer:changed', () => {
    // update order form
    orderForm.payment = buyer.payment;
    orderForm.address = buyer.address;

    // update contacts form
    contactsForm.email = buyer.email;
    contactsForm.phone = buyer.phone;

    // validation via array filter + join
    const errors = buyer.validation();
    const orderErrors = [errors.payment, errors.address].filter(Boolean).join('; ');
    const contactErrors = [errors.email, errors.phone].filter(Boolean).join('; ');

    orderForm.valid = orderErrors.length === 0;
    orderForm.errors = orderErrors.length > 0 ? [orderErrors] : [];

    contactsForm.valid = contactErrors.length === 0;
    contactsForm.errors = contactErrors.length > 0 ? [contactErrors] : [];
});

// order form submit -> show contacts form
events.on('order:submit', () => {
    const errors = buyer.validation();
    if (errors.payment || errors.address) return;
    modal.render({ content: contactsForm.render() });
});

// contacts form submit -> send order
events.on('contacts:submit', () => {
    const errors = buyer.validation();
    if (errors.email || errors.phone) return;

    const request: TPostRequest = {
        payment: buyer.payment,
        email: buyer.email,
        phone: buyer.phone,
        address: buyer.address,
        total: cart.getTotalCartPrice(),
        items: cart.productsList.map((product) => product.id),
    };

    api.setData(request)
        .then((response: TPostResponse) => {
            cart.cleanCart();
            buyer.cleanBuyerData();

            const successElement = cloneTemplate<HTMLElement>(
                document.getElementById('success') as HTMLTemplateElement
            ) as HTMLElement;
            const success = new Success(successElement, events);
            success.total = response.total;
            modal.render({ content: success.render() });
        })
        .catch((error) => {
            console.error('Failed to submit order:', error);
        });
});

// modal:requestClose -> let modal close itself
events.on('modal:requestClose', () => {
    modal.close();
});

fetchCatalog();