import sqlite3
import time
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "celectica.db")

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Таблица категорий
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )''')
    
    # Таблица товаров
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        image_url TEXT,
        style TEXT,
        brand TEXT,
        category_id INTEGER,
        FOREIGN KEY(category_id) REFERENCES categories(id)
    )''')
    
    # Таблица заказов
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        username TEXT,
        items TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Создаем базовые категории
    default_categories = ['Рюкзаки', 'Сумки', 'Аксессуары', 'Обувь']
    for category in default_categories:
        cursor.execute('INSERT OR IGNORE INTO categories (name) VALUES (?)', (category,))
    
    # Добавляем тестовые товары

    
    test_products = [
        ("PANE Lightweight", "Training 'Boogie Woogie'", 24100, 
         "https://example.com/bag1.jpg", "Black/White", "ANKI Originals", 1),
        ("Mizuno S", "Everyday Carry Bag", 14600, 
         "https://example.com/bag2.jpg", "Black", "Mizuno", 2),
        ("Konseal LT", "Outdoor Adventure Pack", 18900, 
         "https://example.com/bag3.jpg", "Black/Silver", "Arc'teryx", 1),
        ("Urban Tote", "Minimalist Tote Bag", 12500, 
         "https://example.com/bag4.jpg", "Beige", "ANKI Originals", 2),
        ("Travel Wallet", "Compact RFID Wallet", 5600, 
         "https://example.com/bag5.jpg", "Black", "ANKI Originals", 3)
    ]
    
    for product in test_products:
        cursor.execute('''
        INSERT OR IGNORE INTO products (name, description, price, image_url, style, brand, category_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', product)
    
    conn.commit()
    conn.close()

def get_products(category_id=None):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    query = 'SELECT * FROM products'
    params = []
    
    if category_id:
        query += ' WHERE category_id = ?'
        params.append(category_id)
    
    cursor.execute(query, tuple(params))
    products = cursor.fetchall()
    conn.close()
    
    columns = ['id', 'name', 'description', 'price', 'image_url', 'style', 'brand', 'category_id']
    return [dict(zip(columns, p)) for p in products]

def get_product(product_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM products WHERE id = ?', (product_id,))
    product = cursor.fetchone()
    conn.close()
    
    if product:
        columns = ['id', 'name', 'description', 'price', 'image_url', 'style', 'brand', 'category_id']
        return dict(zip(columns, product))
    return None

def create_order(user_id, username, items):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Генерируем уникальный ID заказа
    order_id = f"{user_id}_{int(time.time())}"
    
    cursor.execute('''
    INSERT INTO orders (user_id, username, items)
    VALUES (?, ?, ?)
    ''', (user_id, username, json.dumps(items)))
    
    conn.commit()
    conn.close()
    return order_id

def get_categories():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT id, name FROM categories')
    categories = cursor.fetchall()
    conn.close()
    return [{'id': c[0], 'name': c[1]} for c in categories]