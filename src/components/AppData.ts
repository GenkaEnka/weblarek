import { IOrder, IProduct, FormErrors, IOrderForm } from '../types';
import { Model } from './base/Model';
import { IAppState } from '../types';

export class Product extends Model<IProduct> {
  id!: string;
  description!: string;
  image!: string;
  title!: string;
  category!: string;
  price!: number | null;
  selected!: boolean;

  constructor(data: Partial<IProduct>, events: any) {
    super(data, events);
    this.id = data.id || '';
    this.description = data.description || '';
    this.image = data.image || '';
    this.title = data.title || '';
    this.category = data.category || '';
    this.price = data.price ?? null;
    this.selected = data.selected ?? false;
  }
}

/*
  * Класс, описывающий состояние приложения
  * */
export class AppState extends Model<IAppState> {
  // Корзина с товарами
  basket: Product[] = [];

  // Массив со всеми товарами
  store: Product[] = [];

  // Объект заказа клиента
    order: IOrder = {
      items: [],
      payment: '',
      total: 0,
      address: '',
      email: '',
      phone: '',
    };

  // Объект с ошибками форм
  formErrors: FormErrors = {};

  addToBasket(value: Product) {
    this.basket.push(value);
    this.emitChanges('basket:changed', { basket: this.basket });
  }

  deleteFromBasket(id: string) {
    this.basket = this.basket.filter(item => item.id !== id)
    this.emitChanges('basket:changed', { basket: this.basket });
  }

  clearBasket() {
    this.basket.length = 0;
    this.emitChanges('basket:changed', { basket: this.basket });
  }

  getBasketAmount() {
    return this.basket.length;
  }

  setItems() {
    this.order.items = this.basket.map(item => item.id)
  }

  setOrderField(field: keyof IOrderForm, value: string) {
    this.order[field] = value;
    this.emitChanges('buyer:changed', this.order);

    if (this.validateContacts()) {
      this.events.emit('contacts:ready', this.order)
    }
    if (this.validateOrder()) {
      this.events.emit('order:ready', this.order);
    }
  }

  validateContacts() {
    const errors: typeof this.formErrors = {};
    if (!this.order.email) {
      errors.email = 'Необходимо указать email';
    }
    if (!this.order.phone) {
      errors.phone = 'Необходимо указать телефон';
    }
    this.formErrors = errors;
    this.events.emit('contactsFormErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  validateOrder() {
    const errors: typeof this.formErrors = {};
    if (!this.order.address) {
      errors.address = 'Необходимо указать адрес';
    }
    if (!this.order.payment) {
      errors.payment = 'Необходимо указать способ оплаты';
    }
    this.formErrors = errors;
    this.events.emit('orderFormErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  refreshOrder() {
    this.order = {
      items: [],
      total: 0,
      address: '',
      email: '',
      phone: '',
      payment: ''
    };
  }

  getTotalBasketPrice() {
    return this.basket.reduce((sum, next) => sum + (next.price || 0), 0);
  }

  setStore(items: IProduct[]) {
    this.store = items.map((item) => {
      return new Product({ ...item, selected: false }, this.events);
    });
    this.emitChanges('items:changed', { store: this.store });
  }

  resetSelected() {
    this.store.forEach(item => item.selected = false)
  }
}
