import os
from flask import Flask, jsonify, request, send_from_directory
from database import init_db, get_products, get_product, create_order, get_categories

app = Flask(__name__)

def cors(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        response = make_response(f(*args, **kwargs))
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    return decorated_function

@app.before_first_request
def initialize():
    init_db()

@app.route('/api/categories', methods=['GET'])
def categories_api():
    categories = get_categories()
    return jsonify(categories)

@app.route('/api/products', methods=['GET'])
def products_api():
    category = request.args.get('category')
    products = get_products(category)
    return jsonify(products)

@app.route('/api/product/<int:product_id>', methods=['GET'])
def product_api(product_id):
    product = get_product(product_id)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/order', methods=['POST'])
def create_order_api():
    data = request.json
    user_id = data.get('user_id')
    username = data.get('username')
    items = data.get('items')
    
    if not user_id or not items:
        return jsonify({"error": "Missing required parameters"}), 400
    
    order_id = create_order(user_id, username, items)
    return jsonify({
        "order_id": order_id,
        "payment_url": f"https://pay.sbp.nspk.ru/payment?orderId={order_id}"
    })

@app.route('/')
def serve_frontend():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)