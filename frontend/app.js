class AnkiApp {
    constructor() {
        // Состояние приложения
        this.state = {
            currentScreen: 'main',
            cart: {},
            user: null
        };
        
        // Элементы интерфейса
        this.elements = {
            loader: document.getElementById('loader'),
            mainScreen: document.getElementById('main-screen'),
            catalogScreen: document.getElementById('catalog-screen'),
            productScreen: document.getElementById('product-screen'),
            cartScreen: document.getElementById('cart-screen'),
            categories: document.getElementById('categories'),
            products: document.getElementById('products'),
            productDetail: document.getElementById('product-detail'),
            cartItems: document.getElementById('cart-items'),
            totalPrice: document.getElementById('total-price'),
            checkoutBtn: document.getElementById('checkout-btn')
        };
        
        // API базовый URL
        this.API_URL = 'https://celectica-luxe-sovereign.cloudpub.ru/'; // Замените на ваш URL
        this.isTelegramWebApp = false;
    }

    // Инициализация приложения
    async init() {
        try {
            console.log('Initializing AnkiApp...');
            
            // Проверяем, запущено ли в Telegram WebApp
            if (window.Telegram && Telegram.WebApp) {
                this.isTelegramWebApp = true;
                Telegram.WebApp.ready();
                Telegram.WebApp.expand();
                
                this.state.user = {
                    id: Telegram.WebApp.initDataUnsafe.user?.id,
                    username: Telegram.WebApp.initDataUnsafe.user?.username,
                    full_name: [
                        Telegram.WebApp.initDataUnsafe.user?.first_name,
                        Telegram.WebApp.initDataUnsafe.user?.last_name
                    ].filter(Boolean).join(' ')
                };
            } else {
                // Режим отладки вне Telegram
                this.state.user = {
                    id: 'debug_user_' + Date.now(),
                    username: 'debug_user',
                    full_name: 'Debug User'
                };
                console.warn('Running in debug mode (not in Telegram WebApp)');
            }
            
            // Загружаем корзину
            this.loadCart();
            
            // Показываем главный экран
            this.showScreen('main');
            this.hideLoader();
            
            // Настройка обработчиков событий
            this.setupEventListeners();
            
            console.log('AnkiApp initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            this.hideLoader();
            this.showError('Ошибка инициализации приложения');
        }
    
            
            // Проверяем, запущено ли в Telegram WebApp
            if (window.Telegram && Telegram.WebApp) {
                this.isTelegramWebApp = true;
                Telegram.WebApp.ready();
                Telegram.WebApp.expand();
                
                this.state.user = {
                    id: Telegram.WebApp.initDataUnsafe.user?.id,
                    username: Telegram.WebApp.initDataUnsafe.user?.username,
                    full_name: [
                        Telegram.WebApp.initDataUnsafe.user?.first_name,
                        Telegram.WebApp.initDataUnsafe.user?.last_name
                    ].filter(Boolean).join(' ')
                };
            } else {
                // Режим отладки вне Telegram
                this.state.user = {
                    id: 'debug_user_' + Date.now(),
                    username: 'debug_user',
                    full_name: 'Debug User'
                };
                console.warn('Running in debug mode (not in Telegram WebApp)');
            }
            
            // Загружаем корзину
            this.loadCart();
            
            // Показываем главный экран
            this.showScreen('main');
            this.hideLoader();
            
            // Настройка обработчиков событий
            this.setupEventListeners();
            
            console.log('AnkiApp initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            this.hideLoader();
            this.showError('Ошибка инициализации приложения');
            
            // Получаем данные пользователя из Telegram
            this.state.user = {
                id: Telegram.WebApp.initDataUnsafe.user?.id || Date.now().toString(),
                username: Telegram.WebApp.initDataUnsafe.user?.username || 'guest',
                full_name: [
                    Telegram.WebApp.initDataUnsafe.user?.first_name,
                    Telegram.WebApp.initDataUnsafe.user?.last_name
                ].filter(Boolean).join(' ')
            };
            
            console.log('Пользователь:', this.state.user);
            
            // Инициализируем Telegram WebApp
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            Telegram.WebApp.MainButton.hide();
            
            // Загружаем сохраненную корзину
            this.loadCart();
            
            // Показываем главный экран
            this.showScreen('main');
            this.hideLoader();
            
            // Настройка обработчиков событий
            this.setupEventListeners();
            
            console.log('AnkiApp успешно инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.hideLoader();
            alert('Ошибка инициализации приложения');
        }
    

    // Показать экран
    showScreen(screenName) {
        console.log(`Переход на экран: ${screenName}`);
        // Скрыть все экраны
        Object.keys(this.elements).forEach(key => {
            if (key.includes('Screen') && this.elements[key]) {
                this.elements[key].style.display = 'none';
            }
        });
        
        // Показать запрошенный экран
        this.state.currentScreen = screenName;
        switch(screenName) {
            case 'main':
                this.elements.mainScreen.style.display = 'block';
                break;
            case 'catalog':
                this.elements.catalogScreen.style.display = 'block';
                this.loadCategories();
                this.loadProducts();
                break;
            case 'product':
                this.elements.productScreen.style.display = 'block';
                break;
            case 'cart':
                this.elements.cartScreen.style.display = 'block';
                this.renderCart();
                break;
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработчики меню
        document.querySelectorAll('.btn-menu').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showScreen(btn.dataset.page);
            });
        });
        
        // Обработчики назад
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showScreen(btn.dataset.back);
            });
        });
        
        // Обработчик оформления заказа
        if (this.elements.checkoutBtn) {
            this.elements.checkoutBtn.addEventListener('click', () => this.checkout());
        }
    }

    // Загрузка категорий
    async loadCategories() {
        console.log('Загрузка категорий...');
        try {
            const response = await fetch(`${this.API_URL}/categories`);
            const categories = await response.json();
            
            this.elements.categories.innerHTML = '';
            categories.forEach(category => {
                const categoryEl = document.createElement('div');
                categoryEl.className = 'category';
                categoryEl.textContent = category.name;
                categoryEl.onclick = () => this.loadProducts(category.id);
                this.elements.categories.appendChild(categoryEl);
            });
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    }

    async loadProducts(categoryId = null) {
        this.showLoader();
        try {
            const url = categoryId 
                ? `${this.API_URL}/api/products?category=${categoryId}`
                : `${this.API_URL}/api/products`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const products = await response.json();
            this.state.products = products; // Сохраняем продукты для корзины
            
            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Ошибка загрузки товаров');
        } finally {
            this.hideLoader();
        }
    }

    renderProducts(products) {
        this.elements.products.innerHTML = '';
        products.forEach(product => {
            const productEl = document.createElement('div');
            productEl.className = 'product-card';
            productEl.onclick = () => this.showProductDetail(product.id);
            
            productEl.innerHTML = `
                <div class="product-image">
                    <img src="${product.image_url || 'https://via.placeholder.com/150'}" 
                         alt="${product.name}" 
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/150'">
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand || ''}</div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${this.formatPrice(product.price)} ₽</div>
                </div>
            `;
            
            this.elements.products.appendChild(productEl);
        });
    }

    renderCart() {
        if (Object.keys(this.state.cart).length === 0) {
            this.elements.cartItems.innerHTML = '<div class="empty-cart">Ваша корзина пуста</div>';
            this.elements.totalPrice.textContent = '0';
            return;
        }
        
        let total = 0;
        this.elements.cartItems.innerHTML = '';
        
        Object.keys(this.state.cart).forEach(productId => {
            const quantity = this.state.cart[productId];
            const product = this.state.products.find(p => p.id == productId) || {
                id: productId,
                name: `Товар ${productId}`,
                price: 1000,
                image_url: 'https://via.placeholder.com/80'
            };
            
            const itemTotal = product.price * quantity;
            total += itemTotal;
            
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-image">
                    <img src="${product.image_url}" alt="${product.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${product.name}</div>
                    <div class="cart-item-price">${this.formatPrice(product.price)} ₽ × ${quantity}</div>        
                    <div class="cart-item-total">${this.formatPrice(itemTotal)} ₽</div>
                </div>
            `;
            
            this.elements.cartItems.appendChild(itemEl);
        });
        
        this.elements.totalPrice.textContent = this.formatPrice(total);
    }

    showError(message) {
        alert(message); // В реальном приложении лучше использовать красивый toast
    }



        

    // Показать детали товара
    async showProductDetail(productId) {
        this.showLoader();
        console.log(`Загрузка деталей товара: ${productId}`);
        
        try {
            const response = await fetch(`${this.API_URL}/product/${productId}`);
            const product = await response.json();
            
            document.getElementById('product-title').textContent = product.name;
            
            this.elements.productDetail.innerHTML = `
                <div class="product-detail-image">
                    <img src="${product.image_url}" alt="${product.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/300'">
                </div>
                <div class="product-detail-info">
                    <h3>${product.brand} ${product.name}</h3>
                    <p class="product-detail-desc">${product.description}</p>
                    
                    <div class="detail-row">
                        <span class="detail-label">Стиль:</span>
                        ${product.style}
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Цена:</span>
                        ${this.formatPrice(product.price)} p.
                    </div>
                    
                    <div class="cart-controls">
                        <div class="cart-quantity">
                            <button class="btn-quantity" onclick="app.changeQuantity(${product.id}, -1)">-</button>
                            <span class="quantity-value" id="quantity-${product.id}">
                                ${this.state.cart[product.id] || 0}
                            </span>
                            <button class="btn-quantity" onclick="app.changeQuantity(${product.id}, 1)">+</button>
                        </div>
                        
                        <button class="btn-add-cart" onclick="app.addToCart(${product.id})">
                            ${this.state.cart[product.id] ? 'В КОРЗИНЕ' : 'В КОРЗИНУ'}
                        </button>
                    </div>
                </div>
            `;
            
            this.showScreen('product');
            this.hideLoader();
        } catch (error) {
            console.error('Ошибка загрузки товара:', error);
            this.hideLoader();
        }
    }

    // Изменить количество товара
    changeQuantity(productId, delta) {
        const current = this.state.cart[productId] || 0;
        const newValue = Math.max(0, current + delta);
        
        if (newValue === 0) {
            delete this.state.cart[productId];
        } else {
            this.state.cart[productId] = newValue;
        }
        
        document.getElementById(`quantity-${productId}`).textContent = newValue;
        this.saveCart();
    }

    // Добавить в корзину
    addToCart(productId) {
        this.state.cart[productId] = this.state.cart[productId] 
            ? this.state.cart[productId] + 1 
            : 1;
        this.saveCart();
        this.showScreen('cart');
    }

    // Сохранить корзину
    saveCart() {
        localStorage.setItem('anki_cart', JSON.stringify(this.state.cart));
    }

    // Загрузить корзину
    loadCart() {
        const savedCart = localStorage.getItem('anki_cart');
        if (savedCart) {
            this.state.cart = JSON.parse(savedCart);
        }
    }

    // Отобразить корзину
    renderCart() {
        if (Object.keys(this.state.cart).length === 0) {
            this.elements.cartItems.innerHTML = '<div class="empty-cart">Ваша корзина пуста</div>';
            this.elements.totalPrice.textContent = '0';
            return;
        }
        
        // Рассчитываем общую сумму
        let total = 0;
        
        // Очищаем контейнер
        this.elements.cartItems.innerHTML = '';
        
        // Для каждого товара в корзине
        Object.keys(this.state.cart).forEach(productId => {
            const quantity = this.state.cart[productId];
            // В реальном приложении нужно загружать данные о товаре с сервера
            // Здесь используем заглушку
            const product = {
                id: productId,
                name: `Товар ${productId}`,
                price: 1000 * parseInt(productId),
                image: 'https://via.placeholder.com/80'
            };
            
            const itemTotal = product.price * quantity;
            total += itemTotal;
            
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${product.name}</div>
                    <div class="cart-item-price">${this.formatPrice(product.price)} p. x ${quantity}</div>        
                    <div class="cart-item-total">${this.formatPrice(itemTotal)} p.</div>
                </div>
            `;
            
            this.elements.cartItems.appendChild(itemEl);
        });
        
        this.elements.totalPrice.textContent = this.formatPrice(total);
    }

    // Оформить заказ
    async checkout() {
        this.showLoader();
        console.log('Оформление заказа...');
        
        try {
            // Преобразуем корзину в формат для сервера
            const items = Object.keys(this.state.cart).map(productId => ({
                product_id: parseInt(productId),
                quantity: this.state.cart[productId]
            }));
            
            const response = await fetch(`${this.API_URL}/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.state.user.id,
                    username: this.state.user.username,
                    items: items
                })
            });
            
            const result = await response.json();
            
            // Показываем кнопку оплаты в Telegram
            Telegram.WebApp.MainButton.setText("ОПЛАТИТЬ");
            Telegram.WebApp.MainButton.setParams({
                color: '#4CAF50',
                text_color: '#FFFFFF'
            });
            Telegram.WebApp.MainButton.onClick(() => {
                window.open(result.payment_url, '_blank');
            });
            Telegram.WebApp.MainButton.show();
            
            this.hideLoader();
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            this.hideLoader();
            alert('Ошибка при оформлении заказа');
        }
    }

    // Вспомогательные функции
    formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    showLoader() {
        if (this.elements.loader) this.elements.loader.style.display = 'block';
    }

    hideLoader() {
        if (this.elements.loader) this.elements.loader.style.display = 'none';
    }
}

// Делаем приложение доступным глобально
window.app = new AnkiApp();