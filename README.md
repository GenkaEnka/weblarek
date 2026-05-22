# WebLarek — интернет-магазин

Фронтенд интернет-магазина "WebLarek", реализующий выбор и покупку товаров.

## Запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка проекта
npm run build
```

## Конфигурация

Перед запуском необходимо скопировать `.env.example` в `.env`:

```bash
cp .env.example .env
```

Переменные окружения:
- `VITE_API_ORIGIN` — базовый URL для API и CDN серверов (по умолчанию `https://larek-api.nomoreparties.co`)

## Архитектура проекта

Проект построен на паттерне **MVP (Model-View-Presenter)**:

- **Model** — модели данных (ProductCatalog, Cart, Buyer), которые хранят состояние приложения и уведомляют об изменениях через события.
- **View** — компоненты отображения (карточки, модальные окна, формы), создающие DOM-разметку.
  - Представления (кроме карточек галереи и корзины) создаются однократно и переиспользуются через ререндеры.
  - Представления не хранят данные и не имеют геттеров.
  - Для доступа к корневым элементам вызывается пустой рендер.
  - Представления перерисовываются при изменении модели (событийный подход).
- **Presenter** — слой связывания моделей и представлений, реализованный в `main.ts`. Подписывается на события моделей и представлений, синхронизируя их.

### Базовые классы

#### `EventEmitter` (`src/components/base/Events.ts`)

Реализует интерфейс `IEvents` — брокер событий, используемый для связи между компонентами приложения (слабая связанность).

- `constructor()` — создаёт пустой Map для хранения подписчиков
- `on<T>(eventName: EventName, callback: (event: T) => void)` — подписка на событие по имени или RegExp
- `off(eventName: EventName, callback: Subscriber)` — отписка от события
- `emit<T>(eventName: string, data?: T)` — генерация события (вызов всех подписчиков)
- `onAll(callback: (event: EmitterEvent) => void)` — подписка на все события (`*`)
- `offAll()` — сброс всех подписчиков
- `trigger<T>(eventName: string, context?: Partial<T>): (data: T) => void` — создаёт функцию-триггер, которая при вызове генерирует указанное событие

Типы:
- `EventName = string | RegExp` — имя события (строка или RegExp)
- `Subscriber = Function` — функция-подписчик
- `EmitterEvent = { eventName: string, data: unknown }` — объект события для `onAll`

#### `Component<T>` (`src/components/base/Component.ts`)

Базовый абстрактный класс для всех компонентов представления.
- `constructor(container: HTMLElement)` — принимает корневой DOM-элемент
- `render(data?: Partial<T>): HTMLElement` — принимает частичные данные, присваивает их в `this` через `Object.assign` и возвращает корневой элемент
- `setImage(element: HTMLImageElement, src: string, alt?: string)` — устанавливает изображение (src и опционально alt)

#### `Form` (`src/components/base/Form.ts`)

Базовый класс для форм оформления заказа. Родитель для `OrderForm` и `ContactsForm`.

- `constructor(container: HTMLFormElement, events: IEvents)` — принимает DOM-элемент формы и брокер событий
  - Находит кнопку отправки по селектору `.modal__actions .button`
  - Находит элемент ошибок `.form__errors`
  - Подписывается на `submit` формы — генерирует событие `[formName]:submit`
  - Подписывается на `input` — генерирует `[formName]Input:change` с `{ field, value }`
- Поля: `_form: HTMLFormElement`, `_errors: HTMLElement`, `_submit: HTMLButtonElement`, `events: IEvents`, `formElement: HTMLFormElement`
- `valid: boolean` (set) — активирует/деактивирует кнопку отправки
- `errors: string[]` (set) — отображает ошибки валидации
- `render()` — возвращает `_form`

#### `Card` (`src/components/base/Card.ts`)

Базовый класс для карточки товара. Содержит только поля, общие для всех типов карточек.

- `constructor(container: HTMLElement, events?: IEvents)` — находит `.card__title`, `.card__price`
- Сеттеры:
  - `title: string` (set) — название товара
  - `price: number | null` (set) — цена. Если `null` → текст "Бесценно"
- `render(data?: Partial<IProduct>): HTMLElement` — применяет переданные данные к карточке

#### `CardDetailed` (`src/components/base/CardDetailed.ts`)

Промежуточный класс, расширяющий `Card` для карточек каталога и превью. Содержит поля для изображения, категории, кнопки и описания.

- Наследует `Card`
- `constructor(container: HTMLElement, events?: IEvents)` — находит `.card__image`, `.card__category`, `.card__button`, `.card__text`
- Сеттеры:
  - `image: string` (set) — URL изображения (дополняется `CDN_URL`)
  - `category: string` (set) — категория, устанавливает CSS-класс фона через `categoryMap`
  - `description: string` (set) — описание товара
- `render(data?: Partial<IProduct>): HTMLElement` — применяет все переданные данные

#### `Api` (`src/components/base/Api.ts`)

Базовый класс для HTTP-запросов. Реализует интерфейс `IApi`.

- `constructor(baseUrl: string, options?: RequestInit)` — принимает базовый URL и опциональные настройки запроса
- `get<T>(uri: string): Promise<T>` — GET-запрос
- `post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>` — POST/PUT/DELETE-запрос
- `handleResponse<T>(response: Response): Promise<T>` — обработка ответа сервера

### Компоненты представления (View)

| Класс | Шаблон | Назначение |
|-------|--------|------------|
| `Header` | `.header` | Шапка страницы с кнопкой корзины и счётчиком. Событие `basket:open` |
| `Gallery` | `.gallery` | Галерея карточек товаров. Сеттер `items` заменяет содержимое |
| `CardCatalog` | `#card-catalog` | Карточка товара в каталоге. Через колбэк `onClick` уведомляет о клике |
| `CardPreview` | `#card-preview` | Детальная карточка в модалке. Сеттеры `buttonText`, `buttonDisabled` для управления кнопкой |
| `CardBasket` | `#card-basket` | Карточка товара в корзине. Через колбэк `onDelete` уведомляет об удалении |
| `Modal` | `.modal` | Модальное окно. Закрытие по клику вне окна, крестику, Escape |
| `Basket` | `#basket` | Представление корзины. Кнопка изначально задизейблена. Сеттеры: `items`, `total`, `valid` |
| `OrderForm` | `#order` | Форма выбора способа оплаты и ввода адреса доставки |
| `ContactsForm` | `#contacts` | Форма ввода email и телефона |
| `Success` | `#success` | Сообщение об успешном оформлении заказа |

#### `Header` (`src/components/view/Header.ts`)
Наследует `Component<{}>`.
- `constructor(container: HTMLElement, events: IEvents)` — находит `.header__basket-counter`, `.header__basket`
  - По клику на корзину генерирует `basket:open`
- Сеттеры:
  - `counter: number` — количество товаров в корзине

#### `Gallery` (`src/components/view/Gallery.ts`)
Наследует `Component<{}>`.
- `constructor(container: HTMLElement, events: IEvents)` — находит `.gallery`
- Сеттеры:
  - `items: HTMLElement[]` — заменяет содержимое галереи

#### `CardCatalog` (`src/components/view/CardCatalog.ts`)
Наследует `CardDetailed`.
- `constructor(container: HTMLElement, onClick: (id: string) => void)` — принимает колбэк, вызываемый при клике на карточку
- В `render()` захватывает `id` через замыкание для колбэка

#### `CardPreview` (`src/components/view/CardPreview.ts`)
Наследует `CardDetailed`.
- `constructor(container: HTMLElement, events: IEvents)` — по клику на кнопку генерирует `card:previewToggle` (без данных)
- Сеттеры (настраиваются презентером, не самим представлением):
  - `buttonText: string` — текст кнопки ("Купить" / "Удалить из корзины")
  - `buttonDisabled: boolean` — блокировка кнопки (для товаров без цены)

#### `CardBasket` (`src/components/view/CardBasket.ts`)
Наследует `Card`.
- `constructor(container: HTMLElement, onDelete: (id: string) => void)` — принимает колбэк для удаления
- Сеттеры:
  - `index: number` — порядковый номер в корзине
- В `render()` захватывает `id` через замыкание для колбэка удаления

#### `Modal` (`src/components/view/Modal.ts`)
Наследует `Component<{}>`.
- `constructor(container: HTMLElement, events: IEvents)` — принимает модальное окно и брокер событий
  - Подписывается на клик по крестику → `this.close()`
  - Подписывается на клик по оверлею → `this.close()`
  - Подписывается на `keydown` с `Escape` → `this.close()`
- `open()` — добавляет класс `modal_active`, генерирует `modal:open`
- `close()` — убирает `modal_active`, очищает содержимое, генерирует `modal:close`
- `content: HTMLElement` (set) — заменяет содержимое `.modal__content`
- `render(data?: { content: HTMLElement }): HTMLElement` — устанавливает контент, открывает модалку

#### `Basket` (`src/components/view/Basket.ts`)
Наследует `Component<{}>`.
- `constructor(template: HTMLTemplateElement, events: IEvents)` — клонирует шаблон, ищет `.basket__list`, `.basket__price`, `.basket__button`
  - Изначально кнопка оформления задизейблена
  - По клику на кнопку генерирует `order:open`
- Сеттеры:
  - `items: HTMLElement[]` — список элементов корзины. Если пусто — текст "Корзина пуста"
  - `total: number` — итоговая сумма
  - `valid: boolean` — активация/деактивация кнопки оформления
- `render(): HTMLElement` — возвращает корневой элемент

#### `OrderForm` (`src/components/view/OrderForm.ts`)
Наследует `Form`.
- `constructor(container: HTMLFormElement, events: IEvents)` — находит кнопки `button[name="card"]` и `button[name="cash"]`
  - При клике на кнопку генерирует `payment:change` с выбранным типом оплаты
  - Представление не переключает активный класс самостоятельно — это делает презентер через сеттер `payment`
- Сеттеры:
  - `payment: TPayment` — устанавливает активный способ оплаты (визуальный класс `button_alt-active`)
  - `address: string` — устанавливает значение поля ввода адреса

#### `ContactsForm` (`src/components/view/ContactsForm.ts`)
Наследует `Form`.
- Сеттеры:
  - `email: string` — устанавливает значение поля email
  - `phone: string` — устанавливает значение поля телефона

#### `Success` (`src/components/view/Success.ts`)
Наследует `Component<{}>`.
- `constructor(container: HTMLElement, events: IEvents)` — принимает уже склонированный элемент, находит `.order-success__close` и `.order-success__description`
  - По клику на кнопку генерирует `modal:requestClose`
- Сеттеры:
  - `total: number` — текст "Списано N синапсов"
- `render(): HTMLElement` — возвращает корневой элемент

### Модели данных (Model)

#### `ProductCatalog` (`src/components/models/ProductCatalog.ts`)
Каталог товаров. Хранит список товаров и выбранный для просмотра товар.
- `constructor(events: IEvents)`
- `productsList: IProduct[]` (get/set) — список товаров. При установке генерирует `cards:changed`
- `getProductByID(id: string): IProduct | null` — поиск товара по id
- `focusCard: IProduct | null` (get/set) — выбранный для просмотра товар. При установке генерирует `preview:changed`

#### `Cart` (`src/components/models/Cart.ts`)
Корзина товаров. Хранит добавленные товары.
- `constructor(events: IEvents)`
- `productsList: IProduct[]` (get) — список товаров в корзине
- `addProduct(product: IProduct): void` — добавляет товар. Генерирует `basket:changed`
- `discardProduct(product: IProduct): void` — удаляет товар. Генерирует `basket:changed`
- `cleanCart(): void` — очищает корзину. Генерирует `basket:changed`
- `getTotalCartPrice(): number` — суммарная стоимость всех товаров
- `getProductCountInCart(): number` — количество товаров в корзине
- `isProductInCartById(id: string): boolean` — проверяет, есть ли товар с указанным id в корзине

#### `Buyer` (`src/components/models/Buyer.ts`)
Данные покупателя. Хранит и валидирует информацию о заказе.
- `constructor(events: IEvents)`
- Поля (get/set): `payment`, `address`, `phone`, `email`. Каждый сеттер генерирует `buyer:changed`
- `getBuyerData(): IBuyer` — возвращает объект с данными покупателя
- `cleanBuyerData(): void` — очищает все поля. Генерирует `buyer:changed`
- `validation(): TBuyerErrors` — проверяет заполнение всех полей, возвращает объект с ошибками

### API сервис

#### `ClientApi` (`src/components/services/ClientApi.ts`)
Клиент для взаимодействия с сервером бэкенда. Использует композицию с `Api`.
- `constructor(api: IApi)` — принимает экземпляр API
- `getData(): Promise<TGetResponse>` — GET-запрос к `/product`
- `setData(data: TPostRequest): Promise<TPostResponse>` — POST-запрос к `/order`

### События приложения

| Событие | Источник | Данные | Описание |
|---------|----------|--------|----------|
| `cards:changed` | ProductCatalog | `{ products: IProduct[] }` | Изменение списка товаров в каталоге |
| `card:select` | CardCatalog | `{ id: string }` | Клик по карточке в каталоге |
| `preview:changed` | ProductCatalog | `{ product: IProduct \| null }` | Изменение выбранного для просмотра товара |
| `card:previewToggle` | CardPreview | — | Клик по кнопке в превью (данные берутся из `focusCard` модели) |
| `basket:changed` | Cart | `{ products: IProduct[] }` | Изменение содержимого корзины |
| `basket:open` | Header | — | Клик по иконке корзины в шапке |
| `order:open` | Basket | — | Клик "Оформить" в корзине |
| `order:submit` | OrderForm | — | Отправка формы заказа |
| `orderInput:change` | Form | `{ field: string, value: string }` | Изменение поля формы заказа |
| `payment:change` | OrderForm | `{ payment: TPayment }` | Выбор способа оплаты |
| `contacts:submit` | ContactsForm | — | Отправка формы контактов |
| `contactsInput:change` | Form | `{ field: string, value: string }` | Изменение поля формы контактов |
| `modal:open` | Modal | — | Открытие модального окна |
| `modal:close` | Modal | — | Закрытие модального окна |
| `modal:requestClose` | Success | — | Запрос на закрытие модалки |
| `buyer:changed` | Buyer | `IBuyer` | Изменение любого поля данных покупателя |

### Типы данных

```typescript
// Способ оплаты
type TPayment = 'card' | 'cash' | '';

// Товар
interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

// Данные покупателя
interface IBuyer {
    payment: TPayment;
    email: string;
    phone: string;
    address: string;
}

// Ошибки валидации покупателя
type TBuyerErrors = Partial<Record<keyof IBuyer, string>>;

// HTTP методы
type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

// Интерфейс HTTP-клиента
interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

// Ответ сервера при получении товаров
type TGetResponse = { total: number; items: IProduct[] };

// Ответ сервера при отправке заказа
type TPostResponse = { id: string; total: number };

// Тело запроса на сервер
type TPostRequest = IBuyer & { total: number; items: string[] };
```

### Презентер

Презентер реализован в `src/main.ts`. Он не выделен в отдельный класс — логика связывания размещена в основном скрипте приложения.

Ключевые принципы работы презентера:
1. Создаёт экземпляры моделей (`ProductCatalog`, `Cart`, `Buyer`) и представлений
2. Все представления (кроме карточек каталога и корзины) создаются **однократно** и переиспользуются
3. Представления обновляются только при изменении соответствующих моделей (событийный подход)
4. Валидация форм выполняется универсально: `[errors.payment, errors.address].filter(Boolean).join('; ')`
5. При открытии корзины и форм заказа вызывается только пустой `render()` для получения контейнера
6. Блокировка страницы при открытой модалке реализована через класс `page__wrapper_locked`
7. После успешного заказа очищает корзину и данные покупателя

### Вспомогательные модули

#### `utils/constants.ts`
- `BASE_URL` — базовый URL из переменной окружения `VITE_API_ORIGIN`
- `API_URL` — полный URL к API
- `CDN_URL` — полный URL к CDN для изображений
- `categoryMap` — маппинг названий категорий на CSS-классы

#### `utils/utils.ts`
- `pascalToKebab(value: string): string` — преобразует PascalCase в kebab-case
- `ensureAllElements<T>(selectorElement, context?)` — гарантированно возвращает массив элементов
- `ensureElement<T>(selectorElement, context?)` — гарантированно возвращает один элемент
- `cloneTemplate<T>(query): T` — клонирует содержимое HTMLTemplateElement
- `bem(block, element?, modifier?)` — формирует BEM-имя и класс
- `setElementData<T>(el, data)` — устанавливает dataset-атрибуты
- `getElementData<T>(el, scheme)` — получает типизированные данные из dataset
- `createElement<T>(tagName, props?, children?)` — фабрика DOM-элементов

### Структура HTML-шаблонов

| ID шаблона | Классы | Назначение |
|------------|--------|------------|
| `#card-catalog` | `.gallery__item.card` | Карточка товара на главной |
| `#card-preview` | `.card.card_full` | Детальная карточка в модалке |
| `#card-basket` | `.basket__item.card.card_compact` | Карточка в списке корзины |
| `#basket` | `.basket` | Модальное окно корзины |
| `#order` | `.form[name="order"]` | Форма заказа (оплата + адрес) |
| `#contacts` | `.form[name="contacts"]` | Форма контактов (email + телефон) |
| `#success` | `.order-success` | Сообщение об успешном заказе |