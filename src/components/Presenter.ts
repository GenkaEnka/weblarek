import { ProductCatalog } from './models/ProductCatalog';
import { Cart } from './models/Cart';
import { Buyer } from './models/Buyer';
import { EventEmitter, IEvents } from './base/Events';
import { ClientApi } from './services/ClientApi';
import { IProduct } from '../types/index';

// View imports
import { Gallery } from './view/Gallery';
import { Modal } from './view/Modal';
import { CardFull } from './view/CardFull';
import { Basket } from './view/Basket';
import { FormPayment } from './view/FormPayment';
import { FormContacts } from './view/FormContacts';
import { OrderSuccess } from './view/OrderSuccess';

export class Presenter {
    protected _events: IEvents;
    protected _api: ClientApi;
    protected _productCatalog: ProductCatalog;
    protected _cart: Cart;
    protected _buyer: Buyer;

    protected _gallery: Gallery;
    protected _modal: Modal;
    protected _cardFull: CardFull;
    protected _basket: Basket;
    protected _formPayment: FormPayment;
    protected _formContacts: FormContacts;
    protected _orderSuccess: OrderSuccess;

    constructor(
        api: ClientApi,
        gallery: Gallery,
        modal: Modal,
        cardFull: CardFull,
        basket: Basket,
        formPayment: FormPayment,
        formContacts: FormContacts,
        orderSuccess: OrderSuccess
    ) {
        this._events = new EventEmitter();
        this._api = api;
        this._productCatalog = new ProductCatalog(this._events);
        this._cart = new Cart(this._events);
        this._buyer = new Buyer(this._events);

        this._gallery = gallery;
        this._modal = modal;
        this._cardFull = cardFull;
        this._basket = basket;
        this._formPayment = formPayment;
        this._formContacts = formContacts;
        this._orderSuccess = orderSuccess;

        this.setupEventListeners();
        this.setupGalleryActions();
        this.setupCardActions();
        this.setupBasketActions();
        this.setupFormPaymentActions();
        this.setupFormContactsActions();
        this.setupBasketButton();
    }

    protected setupEventListeners(): void {
        // Products loaded - update gallery
        this._events.on('products:changed', () => {
            this._gallery.gallery = this._productCatalog.productsList;
        });

        // Card opened - show modal
        this._events.on<IProduct>('card:open', (product: IProduct) => {
            this._cardFull.product = product;
            this._cardFull.inCart = this._cart.isProductInCartById(product.id);
            this._cardFull.render();
            this._modal.open();
        });

        // Cart changed - update basket
        this._events.on('cart:changed', () => {
            this._basket.items = this._cart.productsList;
            
            // Update basket counter in header
            const counter = document.querySelector('.header__basket-counter');
            if (counter) {
                counter.textContent = String(this._cart.productsList.length);
            }
        });

        // Modal closed
        this._events.on('modal:closed', () => {
            this._modal.close();
        });
    }

    protected setupGalleryActions(): void {
        // Gallery needs click handler
        this._gallery.setActions({
            onClick: (product: IProduct) => {

                this._productCatalog.focusCard = product;
            }
        });
    }

    protected setupCardActions(): void {
        // CardFull needs buy/remove handlers
        (this._cardFull as any)._actions = {
            onBuy: (product: IProduct) => {
                this._cart.addProduct(product);
                this._cardFull.inCart = true;
            },
            onRemove: (product: IProduct) => {
                this._cart.discardProduct(product);
                this._cardFull.inCart = false;
            }
        };
    }

    protected setupBasketActions(): void {
        // Basket needs checkout and remove handlers
        (this._basket as any)._actions = {
            onCheckout: () => {
                this._modal.close();
                this.showPaymentForm();
            },
            onRemoveItem: (product: IProduct) => {
                this._cart.discardProduct(product);
            }
        };
    }

    protected setupFormPaymentActions(): void {
        // FormPayment handlers
        (this._formPayment as any)._actions = {
            onSubmit: (data: { payment: string; address: string }) => {
                this._buyer.payment = data.payment as any;
                this._buyer.address = data.address;
                this.showContactsForm();
            }
        };
    }

    protected setupFormContactsActions(): void {
        // FormContacts handlers
        (this._formContacts as any)._actions = {
            onSubmit: (data: { email: string; phone: string }) => {
                this._buyer.email = data.email;
                this._buyer.phone = data.phone;
                this.submitOrder();
            }
        };
    }

    protected setupBasketButton(): void {
        // Basket button click handler
        const basketButton = document.querySelector('.header__basket');
        if (basketButton) {
            basketButton.addEventListener('click', () => {
                // Render basket content and show in modal
                const basketContent = (this._basket as any).render();
                this._modal.content = basketContent;
                this._modal.open();
                
                // Attach checkout button handler
                setTimeout(() => {
                    // Find checkout button (last button in modal__content)
                    const buttons = document.querySelectorAll('.modal__content button');
                    const checkoutBtn = buttons[buttons.length - 1];
                    if (checkoutBtn && !checkoutBtn.hasAttribute('data-checkout-attached')) {
                        checkoutBtn.setAttribute('data-checkout-attached', 'true');
                        checkoutBtn.addEventListener('click', () => {
                            this._modal.close();
                            this.showPaymentForm();
                        });
                    }
                }, 0);
            });
        }
    }

    protected showPaymentForm(): void {
        // Show payment form in modal
        const formContent = document.createElement('div');
        let selectedPayment = '';
        
        formContent.innerHTML = `
            <h2>Способ оплаты</h2>
            <div class="form__buttons">
                <button class="button button_alt" data-payment="card">Карта</button>
                <button class="button button_alt" data-payment="cash">Наличные</button>
            </div>
            <div class="form__group">
                <label for="address">Адрес доставки</label>
                <input type="text" name="address" id="address" placeholder="Укажите адрес">
            </div>
            <button type="button" class="button payment-submit">Далее</button>
        `;
        
        this._modal.content = formContent;
        
        // Add event handlers after content is set
        setTimeout(() => {
            const paymentBtns = document.querySelectorAll('[data-payment]');
            const nextBtn = document.querySelector('.payment-submit');
            const addressInput = document.querySelector('#address') as HTMLInputElement;
            
            // Payment method selection
            paymentBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    paymentBtns.forEach(b => b.classList.remove('button_alt-active'));
                    btn.classList.add('button_alt-active');
                    selectedPayment = (btn as HTMLButtonElement).getAttribute('data-payment') || '';
                });
            });
            
            // Next button
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (selectedPayment && addressInput?.value) {
                        this._buyer.payment = selectedPayment as any;
                        this._buyer.address = addressInput.value;
                        this.showContactsForm();
                    } else {
                        alert('Выберите способ оплаты и укажите адрес');
                    }
                });
            }
        }, 0);
    }

    protected showContactsForm(): void {
        // Show contacts form in modal
        const formContent = document.createElement('div');
        formContent.innerHTML = `
            <h2>Контактные данные</h2>
            <div class="form__group">
                <label for="email">Email</label>
                <input type="email" name="email" id="email" placeholder="Укажите email">
            </div>
            <div class="form__group">
                <label for="phone">Телефон</label>
                <input type="tel" name="phone" id="phone" placeholder="Укажите телефон">
            </div>
            <button type="button" class="button contacts-submit">Оплатить</button>
        `;
        this._modal.content = formContent;
        
        // Add event handlers
        setTimeout(() => {
            const emailInput = document.querySelector('#email') as HTMLInputElement;
            const phoneInput = document.querySelector('#phone') as HTMLInputElement;
            const submitBtn = document.querySelector('.contacts-submit');
            
            if (submitBtn) {
                submitBtn.addEventListener('click', () => {
                    if (emailInput?.value && phoneInput?.value) {
                        this._buyer.email = emailInput.value;
                        this._buyer.phone = phoneInput.value;
                        this.submitOrder();
                    } else {
                        alert('Укажите email и телефон');
                    }
                });
            }
        }, 0);
    }

    protected async submitOrder(): Promise<void> {
        const orderData = {
            payment: this._buyer.payment,
            email: this._buyer.email,
            phone: this._buyer.phone,
            address: this._buyer.address,
            total: this._cart.getTotalCartPrice(),
            items: this._cart.productsList.map(p => p.id)
        };

        try {
            const response = await this._api.setData(orderData);
            this._orderSuccess.total = response.total;
            this._modal.content = this._orderSuccess.render();
        } catch (error) {
            console.error('Order failed:', error);
        }
    }

    protected resetApp(): void {
        this._cart.cleanCart();
        this._buyer.cleanBuyerData();
        this._modal.close();
    }

    async init(): Promise<void> {
        try {
            // Load products from API
            const products = await this._api.getData();
            this._productCatalog.productsList = products.items;
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    }
}

