# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Vite

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/main.ts — точка входа приложения (содержит логику Презентера)
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run dev
```

или

```
yarn
yarn dev
```
## Сборка

```
npm run build
```

или

```
yarn build
```
# Интернет-магазин «Web-Larёk»
«Web-Larёk» — это интернет-магазин с товарами для веб-разработчиков, где пользователи могут просматривать товары, добавлять их в корзину и оформлять заказы. Сайт предоставляет удобный интерфейс с модальными окнами для просмотра деталей товаров, управления корзиной и выбора способа оплаты, обеспечивая полный цикл покупки с отправкой заказов на сервер.

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP (Model-View-Presenter), которая обеспечивает четкое разделение ответственности между классами слоев Model и View. Каждый слой несет свой смысл и ответственность:

Model - слой данных, отвечает за хранение и изменение данных.  
View - слой представления, отвечает за отображение данных на странице.  
Presenter - презентер содержит основную логику приложения и отвечает за связь представления и данных.

Взаимодействие между классами обеспечивается использованием событийно-ориентированного подхода. Модели и Представления генерируют события при изменении данных или взаимодействии пользователя с приложением, а Презентер обрабатывает эти события используя методы как Моделей, так и Представлений.

### Базовый код

#### Класс Component
Является базовым классом для всех компонентов интерфейса.
Класс является дженериком и принимает в переменной `T` тип данных, которые могут быть переданы в метод `render` для отображения.

Конструктор:  
`constructor(container: HTMLElement)` - принимает ссылку на DOM элемент за отображение, которого он отвечает.

Поля класса:  
`container: HTMLElement` - поле для хранения корневого DOM элемента компонента.

Методы класса:  
`render(data?: Partial<T>): HTMLElement` - Главный метод класса. Он принимает данные, которые необходимо отобразить в интерфейсе, записывает эти данные в поля класса и возвращает ссылку на DOM-элемент. Предполагается, что в классах, которые будут наследоваться от `Component` будут реализованы сеттеры для полей с данными, которые будут вызываться в момент вызова `render` и записывать данные в необходимые DOM элементы.  
`setImage(element: HTMLImageElement, src: string, alt?: string): void` - утилитарный метод для модификации DOM-элементов `<img>`
`toggleClass(element: HTMLElement, className: string, force?: boolean): void` - переключение CSS-класса
`setText(element: HTMLElement, value: string): void` - установка текстового содержимого
`setDisabled(element: HTMLElement, state: boolean): void` - смена статуса блокировки
`setHidden(element: HTMLElement): void` - скрыть элемент
`setVisible(element: HTMLElement): void` - показать элемент

#### Класс Api
Содержит в себе базовую логику отправки запросов.

Конструктор:  
`constructor(baseUrl: string, options: RequestInit = {})` - В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.

Поля класса:  
`baseUrl: string` - базовый адрес сервера  
`options: RequestInit` - объект с заголовками, которые будут использованы для запросов.

Методы:  
`get(uri: string): Promise<object>` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер  
`post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object>` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.  
`handleResponse(response: Response): Promise<object>` - защищенный метод проверяющий ответ сервера на корректность и возвращающий объект с данными полученный от сервера или отклоненный промис, в случае некорректных данных.

#### Класс EventEmitter
Брокер событий реализует паттерн "Наблюдатель", позволяющий отправлять события и подписываться на события, происходящие в системе. Класс используется для связи слоя данных и представления.

Конструктор класса не принимает параметров.

Поля класса:  
`_events: Map<string | RegExp, Set<Function>>)` - хранит коллекцию подписок на события. Ключи коллекции - названия событий или регулярное выражение, значения - коллекция функций обработчиков, которые будут вызваны при срабатывании события.

Методы класса:  
`on<T extends object>(event: EventName, callback: (data: T) => void): void` - подписка на событие, принимает название события и функцию обработчик.  
`emit<T extends object>(event: string, data?: T): void` - инициализация события. При вызове события в метод передается название события и объект с данными, который будет использован как аргумент для вызова обработчика.  
`off(eventName: EventName, callback: Subscriber): void` - отписка от события.

#### Класс Model
Является базовым классом для всех моделей данных. Абстрактный класс упрощающий создание моделей с возможностью передачи событий.

Конструктор:  
`constructor(data: Partial<T>, protected events: IEvents)` - принимает частичные данные для инициализации полей и объект брокера событий.

Методы:  
`emitChanges(event: string, payload?: object): void` - генерирует событие через брокер событий с переданным именем и опциональными данными.

### Модели данных

#### Класс Product
Модель отдельного товара. Наследуется от `Model<IProduct>`.

Конструктор:  
`constructor(data: Partial<IProduct>, events: any)` - принимает частичные данные товара и объект брокера событий.

Поля класса:  
`id: string` - уникальный идентификатор товара.  
`description: string` - описание товара.  
`image: string` - ссылка на изображение.  
`title: string` - название товара.  
`category: string` - категория товара.  
`price: number | null` - цена товара (может быть null для бесценных товаров).  
`selected: boolean` - флаг, добавлен ли товар в корзину.

#### Класс AppState
Главный класс состояния приложения. Наследуется от `Model<IAppState>`. Хранит и управляет всеми данными приложения: каталогом товаров, корзиной, заказом и состоянием форм.

Конструктор:  
`constructor(data: Partial<IAppState>, events: IEvents)` - принимает начальные данные и объект брокера событий.

Поля класса:  
`basket: Product[]` - массив товаров в корзине.  
`store: Product[]` - массив всех товаров магазина.  
`order: IOrder` - объект с данными текущего заказа.  
`formErrors: FormErrors` - объект с ошибками валидации.

Методы:  
`addToBasket(value: Product): void` - добавление товара в корзину. Генерирует событие `basket:changed`.  
`deleteFromBasket(id: string): void` - удаление товара из корзины по его id. Генерирует событие `basket:changed`.  
`clearBasket(): void` - полная очистка корзины. Генерирует событие `basket:changed`.  
`getBasketAmount(): number` - получение количества товаров в корзине.  
`getTotalBasketPrice(): number` - получение суммарной стоимости всех товаров в корзине.  
`setItems(): void` - формирование массива id товаров из корзины для отправки на сервер.  
`setOrderField(field: keyof IOrderForm, value: string): void` - заполнение поля заказа. Генерирует событие `buyer:changed`.  
`validateContacts(): boolean` - валидация полей email и phone. Генерирует событие `contactsFormErrors:change`.  
`validateOrder(): boolean` - валидация полей payment и address. Генерирует событие `orderFormErrors:change`.  
`refreshOrder(): void` - сброс данных заказа.  
`setStore(items: IProduct[]): void` - преобразование данных с сервера и сохранение в store. Генерирует событие `items:changed`.  
`resetSelected(): void` - сброс флага selected у всех товаров.

### Типы данных

#### Интерфейс IProduct
Описывает свойства карточки товара.

Поля:  
`id: string` - идентификатор.  
`description: string` - описание.  
`image: string` - ссылка на картинку.  
`title: string` - название.  
`category: CategoryType` - категория.  
`price: number | null` - цена.  
`selected: boolean` - флаг добавления в корзину.

#### Интерфейс IAppState
Описывает внутреннее состояние приложения.

Поля:  
`basket: Product[]` - корзина.  
`store: Product[]` - каталог товаров.  
`order: IOrder` - заказ.  
`formErrors: FormErrors` - ошибки форм.

Методы:  
`addToBasket(value: Product): void`, `deleteFromBasket(id: string): void`, `clearBasket(): void`, `getBasketAmount(): number`, `getTotalBasketPrice(): number`, `setItems(): void`, `setOrderField(field: keyof IOrderForm, value: string): void`, `validateContacts(): boolean`, `validateOrder(): boolean`, `refreshOrder(): void`, `setStore(items: IProduct[]): void`, `resetSelected(): void`.

#### Интерфейс IOrder
Описывает данные заказа.

Поля:  
`items: string[]` - массив id товаров.  
`payment: string` - способ оплаты.  
`total: number` - общая сумма.  
`address: string` - адрес доставки.  
`email: string` - email.  
`phone: string` - телефон.

#### Интерфейс IOrderForm
Описывает поля формы заказа.

Поля:  
`payment: string`, `address: string`, `email: string`, `phone: string`.

#### Типы
`CategoryType` - категория товара: `'другое'`, `'софт-скил'`, `'дополнительное'`, `'кнопка'`, `'хард-скил'`.  
`CategoryMapping` - сопоставление категории с CSS-классом.  
`FormErrors` - ошибки валидации форм.

### Компоненты представления (View)

#### Класс Modal
Отвечает за отображение модальных окон. Позволяет открывать и закрывать модальное окно, управлять его содержимым.

Конструктор:  
`constructor(container: HTMLElement, protected events: IEvents)` - принимает корневой DOM-элемент модального окна и объект брокера событий.

Поля:  
`_closeButton: HTMLButtonElement` - кнопка закрытия.  
`_content: HTMLElement` - контейнер контента.

Методы:  
`set content(value: HTMLElement)` - установка содержимого.  
`open(): void` - открытие (добавляет класс `modal_active`, генерирует `modal:open`).  
`close(): void` - закрытие (удаляет `modal_active`, очищает содержимое, генерирует `modal:close`).  
`render(data: IModalData): HTMLElement` - рендер и открытие.

Закрытие происходит: по клику на крестик, по клику вне модального окна. Модальное окно не скроллится.

#### Класс Form
Базовый класс для форм приложения. Управляет валидацией, состоянием кнопки отправки и отображением ошибок.

Конструктор:  
`constructor(protected container: HTMLFormElement, protected events: IEvents)` - принимает элемент формы и брокер событий.

Поля:  
`_submit: HTMLButtonElement` - кнопка отправки.  
`_errors: HTMLElement` - элемент для ошибок.

Методы:  
`set valid(value: boolean)` - управление доступностью кнопки.  
`set errors(value: string)` - отображение текста ошибки.  
`render(state: Partial<T> & IFormState): HTMLFormElement` - рендер состояния формы.

При вводе генерирует событие `orderInput:change` с полем и значением. При сабмите генерирует событие `{name}:submit`.

#### Класс Card
Базовый класс для отображения карточки товара. Наследуется от `Component<ICard>`.

Конструктор:  
`constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions)` - принимает имя CSS-блока, корневой DOM-элемент и опциональный колбэк onClick.

Поля:  
`_title: HTMLElement`, `_image: HTMLImageElement`, `_category: HTMLElement`, `_price: HTMLElement`, `_button: HTMLButtonElement`.

Сеттеры:  
`id`, `title`, `image`, `category`, `price`, `selected`.

#### Класс StoreItem
Карточка товара в каталоге. Наследуется от `Card`. Использует имя блока `'card'`.

#### Класс StoreItemPreview
Расширенная карточка для модального окна (превью). Наследуется от `Card`.

Дополнительные поля:  
`_description: HTMLElement`.

Дополнительные сеттеры (переопределяют родительские):  
`set description(value: string)` - описание товара.  
`set selected(value: boolean)` - меняет текст кнопки на "Купить" или "Удалить из корзины".  
`set price(value: number | null)` - если цена null, кнопка блокируется и показывает "Недоступно".

#### Класс Basket
Отвечает за отображение корзины.

Конструктор:  
`constructor(protected blockName: string, container: HTMLElement, protected events: IEvents)` - принимает имя блока, корневой элемент и брокер событий.

Поля:  
`_list: HTMLElement`, `_price: HTMLElement`, `_button: HTMLButtonElement`.

Сеттеры и методы:  
`set price(price: number)` - общая стоимость.  
`set list(items: HTMLElement[])` - список товаров. Если список пуст, отображает "Корзина пуста".  
`disableButton(): void` - отключение кнопки оформления.  
`refreshIndices(): void` - обновление порядковых номеров.

При нажатии кнопки "Оформить" генерирует событие `basket:order`.

#### Класс StoreItemBasket
Элемент товара в списке корзины. Наследуется от `Component<IProductBasket>`.

Конструктор:  
`constructor(protected blockName: string, container: HTMLElement, actions?: IStoreItemBasketActions)` - принимает имя блока, корневой элемент и колбэк onClick.

Поля:  
`_index: HTMLElement`, `_title: HTMLElement`, `_price: HTMLElement`, `_button: HTMLButtonElement`.

Сеттеры: `title`, `index`, `price`.

#### Класс Order
Форма заказа с выбором оплаты и адресом. Наследуется от `Form<IOrder>`.

Конструктор:  
`constructor(protected blockName: string, container: HTMLFormElement, protected events: IEvents)` - принимает имя блока, форму и брокер событий.

Поля:  
`_card: HTMLButtonElement` - кнопка "Онлайн".  
`_cash: HTMLButtonElement` - кнопка "При получении".

Методы:  
`disableButtons(): void` - сброс активного состояния кнопок оплаты.

При выборе способа оплаты добавляет класс `button_alt-active` и вызывает `onInputChange`.

#### Класс Contacts
Форма ввода контактных данных (email и телефон). Наследуется от `Form<IContacts>`.

Конструктор:  
`constructor(container: HTMLFormElement, events: IEvents)` - принимает форму и брокер событий.

#### Класс Page
Управляет главной страницей.

Конструктор:  
`constructor(container: HTMLElement, protected events: IEvents)` - принимает корневой элемент страницы и брокер событий.

Поля:  
`_counter: HTMLElement`, `_store: HTMLElement`, `_wrapper: HTMLElement`, `_basket: HTMLElement`.

Сеттеры:  
`set counter(value: number)` - счётчик корзины.  
`set store(items: HTMLElement[])` - карточки товаров.  
`set locked(value: boolean)` - блокировка прокрутки.

При клике на иконку корзины генерирует событие `basket:open`.

#### Класс Success
Окно успешной покупки.

Конструктор:  
`constructor(protected blockName: string, container: HTMLElement, actions?: ISuccessActions)` - принимает имя блока, корневой элемент и колбэк onClick.

Поля:  
`_button: HTMLButtonElement`, `_description: HTMLElement`.

Сеттеры:  
`set description(value: number)` - отображение списанной суммы.

### События приложения

#### События моделей данных (генерируются в AppState)

| Событие | Когда генерируется | Данные |
|---------|-------------------|--------|
| `items:changed` | После получения и сохранения товаров с сервера | `{ store: Product[] }` |
| `basket:changed` | При добавлении/удалении/очистке корзины | `{ basket: Product[] }` |
| `buyer:changed` | При изменении любого поля заказа (payment, address, email, phone) | `IOrder` |
| `orderFormErrors:change` | При валидации полей payment и address | `FormErrors` |
| `contactsFormErrors:change` | При валидации полей email и phone | `FormErrors` |

#### События представлений

| Событие | Когда генерируется | Компонент |
|---------|-------------------|-----------|
| `basket:open` | Клик по иконке корзины | `Page` |
| `basket:order` | Клик "Оформить" в корзине | `Basket` |
| `orderInput:change` | Изменение любого поля в форме | `Form` |
| `{name}:submit` | Сабмит формы (напр. `order:submit`, `contacts:submit`) | `Form` |
| `modal:open` | Открытие модального окна | `Modal` |
| `modal:close` | Закрытие модального окна | `Modal` |

#### События, генерируемые через колбэки в main.ts

| Событие | Когда генерируется |
|---------|-------------------|
| `card:select` | Клик по карточке в каталоге |
| `card:toBasket` | Клик "Купить" в превью |
| `preview:deleteFromBasket` | Клик "Удалить из корзины" в превью |
| `basket:delete` | Клик на кнопку удаления товара в корзине |
| `order:success` | Успешный ответ сервера после отправки заказа |

### Презентер

Презентер реализован в файле `src/main.ts` в виде набора обработчиков событий без выделения в отдельный класс. Этот подход выбран для простоты и наглядности, так как приложение имеет одну страницу и не требует сложной маршрутизации.

Основные обязанности Презентера:
1. Создание экземпляров моделей, компонентов представления и брокера событий.
2. Установка слушателей событий от моделей и представлений.
3. Обработка событий: обновление данных в моделях, перерисовка представлений.
4. Запрос к API для получения товаров и отправки заказа.

Презентер НЕ генерирует события — он только обрабатывает их. Все изменения данных происходят через методы моделей, которые сами генерируют соответствующие события.

Логика работы:
- При загрузке страницы запрашиваются товары с сервера. При успехе сохраняются в модель, что вызывает событие `items:changed`.
- Обработчик `items:changed` создаёт карточки товаров и отображает их в каталоге.
- Клик по карточке -> событие `card:select` -> открывается превью в модальном окне.
- Клик "Купить" -> `card:toBasket` -> товар добавляется в корзину, модалка закрывается.
- Клик "Удалить из корзины" (в превью) -> `preview:deleteFromBasket` -> товар удаляется.
- Клик по иконке корзины -> `basket:open` -> отображается корзина.
- Удаление из корзины -> `basket:delete` -> обновление отображения корзины и счётчика.
- Оформление заказа -> `basket:order` -> открывается форма заказа.
- После ввода адреса и выбора оплаты -> `order:submit` -> открывается форма контактов.
- После ввода email и телефона -> `contacts:submit` -> отправка заказа на сервер.
- При успехе -> `order:success` -> показ окна успеха, очистка корзины и сброс данных.
- Закрытие модального окна -> `modal:close` -> разблокировка страницы.

### Утилиты

#### Функция ensureElement
`ensureElement<T extends HTMLElement>(selectorElement: SelectorElement<T>, context?: HTMLElement): T` - гарантированно возвращает DOM-элемент по селектору или самому элементу.

#### Функция ensureAllElements
`ensureAllElements<T extends HTMLElement>(selectorElement: SelectorCollection<T>, context: HTMLElement): T[]` - возвращает массив DOM-элементов по селектору, NodeList или массиву.

#### Функция cloneTemplate
`cloneTemplate<T extends HTMLElement>(query: string | HTMLTemplateElement): T` - клонирует содержимое HTML-шаблона и возвращает первый дочерний элемент.

#### Функция handlePrice
`handlePrice(price: number): string` - форматирует число: добавляет пробелы между разрядами для удобного отображения цены.

### Константы

`API_URL: string` - базовый URL для API запросов (`/api/weblarek`).  
`CDN_URL: string` - базовый URL для загрузки изображений (`/content/weblarek`).  
`categoryMapping: CategoryMapping` - объект соответствия категорий товаров CSS-классам для стилизации карточек.

### Мок-данные

Для разработки и тестирования используются мок-данные в файле `src/utils/data.ts`. Модуль экспортирует:
`apiProducts` - объект с полями `total` и `items`, содержащий 10 тестовых товаров.  
`initProducts` - массив с одним тестовым товаром для начальной инициализации.