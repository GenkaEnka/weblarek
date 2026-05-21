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
- **View** — компоненты отображения (карточки, модальные окна, формы), которые создают DOM-разметку и генерируют события при действиях пользователя.
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
  - Находит кнопку отправки по селектору `.modal__actions .button` (исключает кнопки-переключатели внутри формы)
  - Находит элемент ошибок `.form__errors`
  - Подписывается на `submit` формы — генерирует событие `[formName]:submit`
  - Подписывается на `input` — генерирует `[formName]Input:change` с `{ field, value }`
- Поля: `_form: HTMLFormElement`, `_errors: HTMLElement`, `_submit: HTMLButtonElement`, `events: IEvents`, `formElement: HTMLFormElement`
- `valid: boolean` (set) — активирует/деактивирует кнопку отправки (`_submit.disabled = !isValid`)
- `errors: string[]` (set) — отображает ошибки валидации в `_errors`
- `render()` — возвращает `_form`

#### `Card` (`src/components/base/Card.ts`)

Базовый класс для карточки товара. Родитель для `CardCatalog`, `CardPreview`, `CardBasket`. Реализует `Component<IProduct>`.

- `constructor(container: HTMLElement, events?: IEvents)` — принимает корневой элемент и опционально брокер событий
  - Находит элементы: `.card__title`, `.card__price`, `.card__image`, `.card__category`, `.card__button`
- Сеттеры:
  - `id: string` (get/set) — идентификатор товара, хранится в `dataset.id`
  - `title: string` (get/set) — название
  - `price: number | null` (set) — цена. Если `null` → текст "Бесценно", кнопка деактивируется
  - `image: string` (set) — URL изображения (дополняется `CDN_URL`)
  - `category: string` (set) — категория, устанавливает CSS-класс фона через `categoryMap`
  - `description: string` (set) — описание (ищет `.card__text`)
- `get price: number | null` — возвращает цену (парсит текст, для "Бесценно" → null)
- `render(data?: Partial<IProduct>): HTMLElement` — применяет переданные данные к карточке

#### `Api` (`src/components/base/Api.ts`)

Базовый класс для HTTP-запросов. Реализует интерфейс `IApi`.

- `constructor(baseUrl: string, options?: RequestInit)` — принимает базовый URL и опциональные настройки запроса (по умолчанию `Content-Type: application/json`)
- `baseUrl: string` — базовый URL API
- `options: RequestInit` — настройки запроса
- `get<T>(uri: string): Promise<T>` — GET-запрос к `baseUrl + uri`
- `post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>` — POST/PUT/DELETE-запрос
- `handleResponse<T>(response: Response): Promise<T>` — обработка ответа сервера

### Компоненты представления (View)

| Класс | Шаблон | Назначение |
|-------|--------|------------|
| `CardCatalog` | `#card-catalog` | Карточка товара в каталоге. При клике генерирует `card:select` |
| `CardPreview` | `#card-preview` | Детальная карточка в модалке. Содержит кнопку "Купить"/"Удалить из корзины". События `card:toBasket`/`card:deleteFromBasket` |
| `CardBasket` | `#card-basket` | Карточка товара в корзине. Содержит кнопку удаления. Событие `basket:delete` |
| `Modal` | `.modal` | Модальное окно. Закрытие по клику вне окна, крестику, Escape |
| `Page` | `body.page` | Главная страница. Сеттеры: `counter`, `gallery`, `locked`. Событие `basket:open` при клике на корзину |
| `Basket` | `#basket` | Представление корзины. Сеттеры: `items`, `total`, `valid`. При пустой корзине — надпись "Корзина пуста". Событие `order:open` |
| `OrderForm` | `#order` | Форма выбора способа оплаты и ввода адреса доставки |
| `ContactsForm` | `#contacts` | Форма ввода email и телефона |
| `Success` | `#success` | Сообщение об успешном оформлении заказа |

#### `CardCatalog` (`src/components/view/CardCatalog.ts`)
Наследует `Card`.
- `constructor(container: HTMLElement, events?: IEvents)` — по клику на карточку генерирует событие `card:select` с `{ id }`

#### `CardPreview` (`src/components/view/CardPreview.ts`)
Наследует `Card`.
- `constructor(container: HTMLElement, events?: IEvents)` — находит `.card__text` для описания; по клику на кнопку проверяет её текст:
  - Если "Купить" → `card:toBasket` (добавить в корзину)
  - Иначе → `card:deleteFromBasket` (удалить из корзины)
- Сеттеры:
  - `description: string` — текст описания
  - `inCart: boolean` — меняет текст кнопки: `true` → "Удалить из корзины", `false` → "Купить"
  - `price: number | null` — переопределяет базовый: при `null` кнопка деактивируется и текст "Недоступно"

#### `CardBasket` (`src/components/view/CardBasket.ts`)
Наследует `Card`.
- `constructor(container: HTMLElement)` — находит `.basket__item-index` (индекс) и `.basket__item-delete` (кнопка удаления). По клику на кнопку генерирует `basket:delete` с `{ id }`
- Сеттеры:
  - `index: number` — порядковый номер в корзине
  - `price: number | null` — переопределяет базовый: не деактивирует кнопку при `null` (в корзине не может быть товаров без цены)

#### `Modal` (`src/components/view/Modal.ts`)
Наследует `Component<{}>`.
- `constructor(container: HTMLElement, events: IEvents)` — принимает модальное окно и брокер событий
  - Находит `.modal__close`, `.modal__content`
  - Подписывается на клик по крестику → `modal:close`
  - Подписывается на клик по оверлею (при совпадении target) → `modal:close`
  - Подписывается на `keydown` с `Escape` (если модалка открыта) → `modal:close`
- `open()` — добавляет класс `modal_active`
- `close()` — убирает `modal_active`, очищает содержимое
- `content: HTMLElement` (set) — заменяет содержимое `.modal__content`
- `render(data?: { content: HTMLElement }): HTMLElement` — устанавливает контент, открывает модалку

#### `Page` (`src/components/view/Page.ts`)
Наследует `Component<{}>`.
- `constructor(container: HTMLElement, events: IEvents)` — находит `.header__basket-counter`, `.gallery`, `.header__basket`, `.page__wrapper`
  - По клику на `.header__basket` генерирует `basket:open`
- Сеттеры:
  - `counter: number` — количество товаров в корзине
  - `gallery: HTMLElement[]` — заменяет содержимое галереи
  - `locked: boolean` — блокирует/разблокирует прокрутку страницы (класс `page__wrapper_locked`)

#### `Basket` (`src/components/view/Basket.ts`)
Наследует `Component<{}>`.
- `constructor(template: HTMLTemplateElement, events: IEvents)` — клонирует шаблон, ищет `.basket__list`, `.basket__price`, `.basket__button`. По клику на кнопку генерирует `order:open`
- Сеттеры:
  - `items: HTMLElement[]` — список элементов корзины. Если пусто — текст "Корзина пуста"
  - `total: number` — итоговая сумма (текст: `"N синапсов"`)
  - `valid: boolean` — активация/деактивация кнопки оформления
- `render(): HTMLElement` — возвращает корневой элемент

#### `OrderForm` (`src/components/view/OrderForm.ts`)
Наследует `Form`.
- `constructor(container: HTMLFormElement, events: IEvents)` — находит кнопки `button[name="card"]` и `button[name="cash"]`. При клике:
  - Переключает активный класс `button_alt-active`
  - Генерирует `payment:change` с выбранным типом оплаты
- Сеттеры:
  - `payment: TPayment` — устанавливает активный способ оплаты
  - `address: string` — устанавливает значение поля ввода адреса

#### `ContactsForm` (`src/components/view/ContactsForm.ts`)
Наследует `Form`.
- `constructor(container: HTMLFormElement, events: IEvents)` — без дополнительной логики
- Сеттеры:
  - `email: string` — устанавливает значение поля email
  - `phone: string` — устанавливает значение поля телефона

#### `Success` (`src/components/view/Success.ts`)
Наследует `Component<{}>`.
- `constructor(template: HTMLTemplateElement, events: IEvents)` — клонирует шаблон, находит `.order-success__close` и `.order-success__description`. По клику на кнопку генерирует `modal:close`
- Сеттеры:
  - `total: number` — текст "Списано N синапсов"
- `render(): HTMLElement` — возвращает корневой элемент

### Модели данных (Model)

#### `ProductCatalog` (`src/components/models/ProductCatalog.ts`)
Каталог товаров. Хранит список товаров и выбранный для просмотра товар.
- `constructor(events: IEvents)`
- `productsList: IProduct[]` (get/set) — список товаров. При установке генерирует `cards:changed` с `{ products }`
- `getProductByID(id: string): IProduct | null` — поиск товара по id
- `focusCard: IProduct | null` (get/set) — выбранный для просмотра товар. При установке генерирует `preview:changed` с `{ product }`

#### `Cart` (`src/components/models/Cart.ts`)
Корзина товаров. Хранит добавленные товары.
- `constructor(events: IEvents)`
- `productsList: IProduct[]` (get) — список товаров в корзине
- `addProduct(product: IProduct): void` — добавляет товар. Генерирует `basket:changed`
- `discardProduct(product: IProduct): void` — удаляет товар (если он есть в корзине). Генерирует `basket:changed`
- `cleanCart(): void` — очищает корзину. Генерирует `basket:changed`
- `getTotalCartPrice(): number` — суммарная стоимость всех товаров
- `getProductCountInCart(): number` — количество товаров в корзине
- `isProductInCartById(id: string): boolean` — проверяет, есть ли товар с указанным id в корзине

#### `Buyer` (`src/components/models/Buyer.ts`)
Данные покупателя. Хранит и валидирует информацию о заказе.
- `constructor(events: IEvents)`
- Поля (get/set): `payment: TPayment`, `address: string`, `phone: string`, `email: string`. Каждый сеттер генерирует `buyer:changed`
- `getBuyerData(): IBuyer` — возвращает объект с данными покупателя
- `cleanBuyerData(): void` — очищает все поля. Генерирует `buyer:changed`
- `validation(): TBuyerErrors` — проверяет заполнение всех полей, возвращает объект с ошибками

### API сервис

#### `ClientApi` (`src/components/services/ClientApi.ts`)
Клиент для взаимодействия с сервером бэкенда. Использует композицию с `Api`.
- `constructor(api: IApi)` — принимает экземпляр API (интерфейс `IApi`)
- `getData(): Promise<TGetResponse>` — GET-запрос к `/product`, возвращает список товаров
- `setData(data: TPostRequest): Promise<TPostResponse>` — POST-запрос к `/order`, отправляет заказ на сервер

### События приложения

| Событие | Источник | Данные | Описание |
|---------|----------|--------|----------|
| `cards:changed` | ProductCatalog | `{ products: IProduct[] }` | Изменение списка товаров в каталоге |
| `card:select` | CardCatalog | `{ id: string }` | Клик по карточке в каталоге |
| `preview:changed` | ProductCatalog | `{ product: IProduct \| null }` | Изменение выбранного для просмотра товара |
| `card:toBasket` | CardPreview | `{ id: string }` | Клик "Купить" — добавить товар в корзину |
| `card:deleteFromBasket` | CardPreview | `{ id: string }` | Клик "Удалить из корзины" — убрать товар |
| `basket:changed` | Cart | `{ products: IProduct[] }` | Изменение содержимого корзины |
| `basket:delete` | CardBasket | `{ id: string }` | Клик на удаление товара из списка корзины |
| `basket:open` | Page | — | Клик по иконке корзины в шапке |
| `order:open` | Basket | — | Клик "Оформить" в корзине |
| `orderInput:change` | OrderForm | `{ field: string, value: string }` | Изменение поля формы заказа |
| `order:submit` | OrderForm | — | Отправка формы заказа (submit) |
| `payment:change` | OrderForm | `{ payment: TPayment }` | Выбор способа оплаты |
| `contactsInput:change` | ContactsForm | `{ field: string, value: string }` | Изменение поля формы контактов |
| `contacts:submit` | ContactsForm | — | Отправка формы контактов (submit) |
| `modal:close` | Modal, Success | — | Закрытие модального окна |
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

Функции презентера:
1. Создаёт экземпляры моделей (`ProductCatalog`, `Cart`, `Buyer`) и представлений (`Page`, `Modal`, `Basket` и др.)
2. Загружает каталог с сервера через `ClientApi` и сохраняет в `ProductCatalog`
3. Подписывается на события моделей (`cards:changed`, `preview:changed`, `basket:changed`) и обновляет представления
4. Подписывается на события представлений (`card:select`, `card:toBasket`, `basket:open`, `order:submit`, `contacts:submit`) и выполняет бизнес-логику
5. Управляет открытием/закрытием модальных окон
6. Выполняет валидацию форм и отправку заказа на сервер
7. После успешного заказа очищает корзину и данные покупателя

### Вспомогательные модули

#### `utils/constants.ts`
- `BASE_URL` — базовый URL из переменной окружения `VITE_API_ORIGIN`
- `API_URL` — полный URL к API (`${BASE_URL}/api/weblarek`)
- `CDN_URL` — полный URL к CDN для изображений (`${BASE_URL}/content/weblarek`)
- `categoryMap` — маппинг названий категорий на CSS-классы для цветового оформления:
  - `'софт-скил'` → `card__category_soft`
  - `'хард-скил'` → `card__category_hard`
  - `'кнопка'` → `card__category_button`
  - `'дополнительное'` → `card__category_additional`
  - `'другое'` → `card__category_other`

#### `utils/utils.ts`
- `pascalToKebab(value: string): string` — преобразует PascalCase в kebab-case
- `isSelector(x: any): x is string` — проверяет, является ли значение CSS-селектором
- `isEmpty(value: any): boolean` — проверка на null/undefined
- `ensureAllElements<T>(selectorElement, context?)` — гарантированно возвращает массив элементов по селектору, NodeList или массиву
- `ensureElement<T>(selectorElement, context?)` — гарантированно возвращает один элемент по селектору или массиву
- `cloneTemplate<T>(query): T` — клонирует содержимое HTMLTemplateElement (первый дочерний элемент)
- `bem(block, element?, modifier?)` — формирует BEM-имя и класс
- `setElementData<T>(el, data)` — устанавливает dataset-атрибуты элемента
- `getElementData<T>(el, scheme)` — получает типизированные данные из dataset-атрибутов
- `isPlainObject(obj): boolean` — проверка на простой объект
- `isBoolean(v): boolean` — проверка на boolean
- `createElement<T>(tagName, props?, children?)` — фабрика DOM-элементов

#### `src/vite-env.d.ts`
Декларация типов для переменных окружения Vite:
```typescript
interface ImportMetaEnv {
  readonly VITE_API_ORIGIN: string
}
```

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