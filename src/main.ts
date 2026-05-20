import './scss/styles.scss';

import { Api } from './components/base/Api';
import { ClientApi } from './components/services/ClientApi';
import { Presenter } from './components/Presenter';

import { Gallery } from './components/view/Gallery';
import { Modal } from './components/view/Modal';
import { CardFull } from './components/view/CardFull';
import { Basket } from './components/view/Basket';
import { FormPayment } from './components/view/FormPayment';
import { FormContacts } from './components/view/FormContacts';
import { OrderSuccess } from './components/view/OrderSuccess';

import { API_URL } from './utils/constants.ts';

// Application initialization
const api = new Api(API_URL);
const clientApi = new ClientApi(api);

// Get DOM containers
const galleryContainer = document.querySelector('.gallery') as HTMLElement;
const modalContainer = document.querySelector('.modal') as HTMLElement;
const cardFullContainer = document.querySelector('.modal__content') as HTMLElement;
const basketContainer = document.querySelector('.basket') as HTMLElement;
const formPaymentContainer = document.querySelector('.form__payment') as HTMLElement;
const formContactsContainer = document.querySelector('.form__contacts') as HTMLElement;

// Verify all containers exist
if (!galleryContainer || !modalContainer || !cardFullContainer) {
    console.error('Required DOM containers not found');
    throw new Error('Missing required DOM elements');
}

// Initialize View components
const gallery = new Gallery(galleryContainer, {
    onClick: () => {
        // Will be handled by Presenter
    }
});

const modal = new Modal(modalContainer, {
    onClose: () => {
        // Will be handled by Presenter
    }
});

const cardFull = new CardFull(cardFullContainer, {
    onBuy: () => {
        // Will be handled by Presenter
    },
    onRemove: () => {
        // Will be handled by Presenter
    }
});

const basket = new Basket(basketContainer || document.createElement('div'), {
    onCheckout: () => {
        // Will be handled by Presenter
    },
    onRemoveItem: () => {
        // Will be handled by Presenter
    }
});

const formPayment = new FormPayment(formPaymentContainer || document.createElement('div'), {
    onSubmit: () => {
        // Will be handled by Presenter
    }
});

const formContacts = new FormContacts(formContactsContainer || document.createElement('div'), {
    onSubmit: () => {
        // Will be handled by Presenter
    }
});

const orderSuccess = new OrderSuccess(cardFullContainer, {
    onClose: () => {
        // Will be handled by Presenter
    }
});

// Initialize Presenter (main coordinator)
const presenter = new Presenter(
    clientApi,
    gallery,
    modal,
    cardFull,
    basket,
    formPayment,
    formContacts,
    orderSuccess
);

// Setup modal close event emission
modal.onClose = () => {
    // Emit event to Presenter
    const events = (presenter as any)._events;
    if (events) {
        events.emit('modal:closed');
    }
};

// Start application
presenter.init().catch((error) => {
    console.error('Failed to initialize application:', error);
});
