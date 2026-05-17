# 🛍️ Проектная работа "Веб-ларек"

> Интернет-магазин для веб-разработчиков с товарами для тестирования функциональности

**Стек:** TypeScript · Vite · SCSS · HTML5  
**Архитектура:** MVP (Model-View-Presenter)  
**Статус:** ✅ Спринт 1 завершен

---

## 📋 Структура проекта

```
src/
├── components/
│   ├── base/                    # Базовые классы
│   │   ├── Api.ts              # HTTP клиент
│   │   ├── Component.ts        # Базовый компонент
│   │   └── Events.ts           # Брокер событий
│   ├── models/                 # Модели данных (Model Layer)
│   │   ├── ProductCatalog.ts  # Каталог товаров
│   │   ├── Cart.ts            # Корзина покупок
│   │   └── Buyer.ts           # Данные покупателя
│   └── services/              # Сервисы коммуникации
│       └── ClientApi.ts       # Клиент API
├── types/
│   └── index.ts               # Типы и интерфейсы
├── utils/
│   ├── constants.ts           # Константы
│   ├── data.ts                # Тестовые данные
│   └── utils.ts               # Утилиты
├── scss/                      # Стили
├── main.ts                    # Точка входа
└── vite-env.d.ts             # Типы Vite
```

**Важные файлы:**
- `index.html` — главная страница
- `src/types/index.ts` — типы и интерфейсы
- `src/main.ts` — точка входа приложения
- `src/scss/styles.scss` — корневой файл стилей
- `src/utils/constants.ts` — константы приложения
- `.env` — переменные окружения

## 🚀 Установка и запуск

### Требуемые переменные окружения

Создайте файл `.env` в корне проекта:
```env
VITE_API_ORIGIN=https://larek-api.nomoreparties.co
```

### Установка и запуск

```bash
npm install
npm run dev
```

или с yarn:

```bash
yarn install
yarn dev
```

### Сборка для продакшена

```bash
npm run build
```

или

```bash
yarn build
```
---

## 📖 Описание проекта

«Web-Larёk» — это интернет-магазин с товарами для веб-разработчиков, где пользователи могут:
- ✅ Просматривать каталог товаров
- ✅ Добавлять товары в корзину
- ✅ Управлять корзиной
- ✅ Оформлять заказы с выбором способа оплаты
- ✅ Отправлять заказы на сервер

Сайт предоставляет удобный интерфейс с модальными окнами для просмотра деталей товаров, управления корзиной и выбора способа оплаты, обеспечивая полный цикл покупки с отправкой заказов на сервер.

---

## 🏗️ Архитектура приложения

Код приложения разделен на **слои согласно парадигме MVP (Model-View-Presenter)**, которая обеспечивает четкое разделение ответственности:

| Слой | Назначение | Компоненты |
|------|-----------|-----------|
| **Model** | Хранение и управление данными | ProductCatalog, Cart, Buyer |
| **View** | Отображение данных на странице | (Спринт 2) |
| **Presenter** | Логика приложения и взаимодействие | (Спринт 2) |
| **Services** | Коммуникация с внешними системами | ClientApi, Api |

**Ключевые принципы:**
- 🔄 **Событийно-ориентированный подход** — все компоненты взаимодействуют через события
- 🎯 **Разделение ответственности** — каждый класс отвечает за одну задачу
- 🔐 **Независимость слоев** — Model не зависит от View
- 📏 **Типобезопасность** — полная типизация всех данных

---

## 🔧 Базовый код

### 🔹 Класс Component

Базовый класс для всех компонентов интерфейса. Является дженериком и принимает тип данных `T`.

**Конструктор:**  
`constructor(container: HTMLElement)` — принимает ссылку на DOM элемент за отображение которого он отвечает.

**Методы:**
- `render(data?: Partial<T>): HTMLElement` — главный метод класса. Отображает данные в интерфейс.
- `setImage(element: HTMLImageElement, src: string, alt?: string): void` — утилитарный метод для модификации изображений

---

### 🔹 Класс Api

Класс для отправки HTTP запросов к серверу.

**Конструктор:**  
`constructor(baseUrl: string, options: RequestInit = {})` — передается адрес сервера и опциональные заголовки.

**Методы:**
- `get(uri: string): Promise<object>` — выполняет GET запрос
- `post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object>` — выполняет POST/PUT/DELETE запрос
- `handleResponse(response: Response): Promise<object>` — защищенный метод проверки ответа сервера

---

### 🔹 Класс EventEmitter

Брокер событий реализует паттерн "Наблюдатель", позволяя отправлять события и подписываться на события.

**Методы:**
- `on<T extends object>(event: EventName, callback: (data: T) => void): void` — подписка на событие
- `emit<T extends object>(event: string, data?: T): void` — срабатывание события
- `trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void` — создание триггера события

---

## Данные (Спринт 1)

### Типы и интерфейсы

#### Тип TPayment
Описывает доступные способы оплаты:
```typescript
type TPayment = 'card' | 'cash' | '';
```

#### Интерфейс IProduct
Описывает структуру товара в каталоге:
```typescript
interface IProduct {
  id: string;              // Уникальный идентификатор
  description: string;     // Полное описание товара
  image: string;          // Путь к изображению товара
  title: string;          // Название товара
  category: string;       // Категория товара
  price: number | null;   // Цена товара (null = недоступно)
}
```

#### Интерфейс IBuyer
Описывает данные покупателя:
```typescript
interface IBuyer {
  payment: TPayment;  // Способ оплаты
  email: string;      // Электронная почта
  phone: string;      // Номер телефона
  address: string;    // Адрес доставки
}
```

#### Тип TBuyerErrors
Описывает ошибки валидации данных покупателя:
```typescript
type TBuyerErrors = Partial<Record<keyof IBuyer, string>>;
```

#### Интерфейс IApi
Описывает методы работы с API:
```typescript
interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}
```

#### Типы для API запросов

**TGetResponse** — ответ сервера при получении каталога:
```typescript
type TGetResponse = {
  total: number;
  items: IProduct[];
}
```

**TPostResponse** — ответ сервера при создании заказа:
```typescript
type TPostResponse = {
  id: string;
  total: number;
}
```

**TPostRequest** — данные для отправки заказа:
```typescript
type TPostRequest = {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}
```

---

## Модели данных (Спринт 1)

### Класс ProductCatalog

Хранит массив всех товаров и товар, выбранный для подробного просмотра.

**Конструктор:**
```typescript
constructor(productsList?: IProduct[], focusCard?: IProduct | null)
```

**Методы:**
- `set productsList(items: IProduct[])` — сохранить массив товаров
- `get productsList(): IProduct[]` — получить массив товаров
- `getProductByID(id: string): IProduct | undefined` — найти товар по id
- `set focusCard(product: IProduct | null)` — установить товар в фокус
- `get focusCard(): IProduct | null` — получить товар из фокуса

**Особенности:**
- Хранит полный каталог товаров
- Отслеживает товар, выбранный пользователем для подробного просмотра
- Независим от представления и других слоев

---

### Класс Cart

Управление корзиной покупок и расчет стоимости.

**Конструктор:**
```typescript
constructor()
```

**Методы:**
- `get productsList(): IProduct[]` — получить товары в корзине
- `addProduct(product: IProduct): void` — добавить товар в корзину
- `removeProduct(product: IProduct): void` — удалить товар из корзины
- `cleanCart(): void` — очистить всю корзину
- `getTotalCartPrice(): number` — получить сумму всех товаров
- `getProductCountInCart(): number` — получить количество товаров
- `isProductInCartById(id: string): boolean` — проверить наличие товара по id

**Особенности:**
- Автоматический расчет стоимости корзины
- Проверка наличия товара перед удалением
- Поддержка пустой корзины

---

### Класс Buyer

Управление данными и валидация информации покупателя.

**Конструктор:**
```typescript
constructor()
```

**Методы:**
- `get payment(): TPayment` / `set payment(val: TPayment)` — способ оплаты
- `get address(): string` / `set address(val: string)` — адрес доставки
- `get phone(): string` / `set phone(val: string)` — номер телефона
- `get email(): string` / `set email(val: string)` — адрес электронной почты
- `cleanBuyerData(): void` — очистить все данные
- `validation(): TBuyerErrors` — валидировать данные

**Правила валидации:**
- Все поля обязательны
- Поле считается ошибочным, если пусто
- Возвращаемый объект содержит только невалидные поля
- Если ошибок нет, возвращается пустой объект

**Пример валидации:**
```typescript
const buyer = new Buyer();
buyer.payment = 'card';
buyer.address = 'Москва, ул. Лесная, 5';

const errors = buyer.validation();
// { email: 'Укажите электронную почту', phone: 'Укажите телефон' }
```

---

## Слой коммуникации (Спринт 1)

### Класс ClientApi

Класс для взаимодействия приложения с сервером.

**Конструктор:**
```typescript
constructor(api: IApi)
```

**Методы:**

#### `async getData(): Promise<TGetResponse>`
Получение каталога товаров с сервера.

**Запрос:** `GET /api/weblarek/product`

**Ответ:**
```typescript
{
  total: 10,
  items: [
    { id: '...', title: '...', price: 750, ... },
    ...
  ]
}
```

#### `async setData(data: TPostRequest): Promise<TPostResponse>`
Отправка заказа на сервер.

**Запрос:** `POST /api/weblarek/order`

**Параметры:**
```typescript
{
  payment: 'card',
  email: 'buyer@example.com',
  phone: '+7 (999) 999-99-99',
  address: 'Москва, ул. Лесная, 5',
  total: 2200,
  items: ['id1', 'id2']
}
```

**Ответ:**
```typescript
{
  id: 'order-123',
  total: 2200
}
```

---

## Примеры использования

### Инициализация моделей

```typescript
import { ProductCatalog, Cart, Buyer } from './components/models';
import { ClientApi } from './components/services/ClientApi';
import { Api } from './components/base/Api';

// Создание моделей данных
const catalog = new ProductCatalog();
const cart = new Cart();
const buyer = new Buyer();

// Создание API сервиса
const api = new Api(import.meta.env.VITE_API_ORIGIN);
const clientApi = new ClientApi(api);
```

### Получение товаров с сервера

```typescript
clientApi.getData()
  .then((data: TGetResponse) => {
    catalog.productsList = data.items;
    console.log(`Загружено товаров: ${data.total}`);
  })
  .catch((error) => {
    console.error('Ошибка при загрузке товаров:', error);
  });
```

### Работа с корзиной

```typescript
// Получить товар по id
const product = catalog.getProductByID('c101ab44-ed99-4a54-990d-47aa2bb4e7d9');

if (product && product.price !== null) {
  // Добавить в корзину
  cart.addProduct(product);
  console.log(`Товар добавлен. В корзине: ${cart.getProductCountInCart()} шт`);
  console.log(`Сумма: ${cart.getTotalCartPrice()} синапсов`);
}

// Проверить наличие товара
if (cart.isProductInCartById(product.id)) {
  console.log('Товар уже в корзине');
  cart.removeProduct(product);
}

// Очистить корзину
cart.cleanCart();
```

### Валидация и отправка заказа

```typescript
// Заполнить данные покупателя
buyer.payment = 'card';
buyer.address = 'Москва, ул. Лесная, 5';
buyer.email = 'buyer@example.com';
buyer.phone = '+7 (999) 999-99-99';

// Валидировать
const errors = buyer.validation();

if (Object.keys(errors).length === 0) {
  // Подготовить данные для отправки
  const orderData: TPostRequest = {
    payment: buyer.payment,
    email: buyer.email,
    phone: buyer.phone,
    address: buyer.address,
    total: cart.getTotalCartPrice(),
    items: cart.productsList.map(p => p.id)
  };

  // Отправить заказ
  clientApi.setData(orderData)
    .then((response) => {
      console.log(`Заказ успешно создан: ${response.id}`);
      cart.cleanCart();
      buyer.cleanBuyerData();
    })
    .catch((error) => {
      console.error('Ошибка при создании заказа:', error);
    });
} else {
  console.log('Ошибки валидации:', errors);
}
```

---

## Конфигурация

### Переменные окружения (.env)

```env
VITE_API_ORIGIN=https://larek-api.nomoreparties.co
```

### Константы (src/utils/constants.ts)

```typescript
export const API_URL = `${import.meta.env.VITE_API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${import.meta.env.VITE_API_ORIGIN}/content/weblarek`;

export const categoryMap = {
  'софт-скил': 'card__category_soft',
  'хард-скил': 'card__category_hard',
  'кнопка': 'card__category_button',
  'дополнительное': 'card__category_additional',
  'другое': 'card__category_other',
};
```

---

## Статус разработки

### ✅ Спринт 8: Проектирование архитектуры (Завершен)
- [x] Типизация данных (IProduct, IBuyer, TPayment)
- [x] Типы для API запросов (TGetResponse, TPostResponse, TPostRequest)
- [x] Класс ProductCatalog с управлением каталогом
- [x] Класс Cart с расчетом стоимости
- [x] Класс Buyer с валидацией
- [x] Класс ClientApi для работы с сервером
- [x] Тестирование всех методов в main.ts
- [x] Конфигурация окружения (.env)
- [x] Полная документация

### 📋 Спринт 9: ~~~ (В разработке)
- [ ] ~~~
- [ ] ~~~
- [ ] ~~~
- [ ] ~~~

https://github.com/GenkaEnka/weblarek