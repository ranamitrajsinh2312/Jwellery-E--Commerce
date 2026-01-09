# Cart API Documentation

## Overview
Complete cart functionality implementation for the Jewelry Shop application with proper authentication and error handling.

## Base URL
```
http://localhost:5001/api/cart
```

## Authentication
All cart endpoints require JWT authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. View Cart
**GET** `/api/cart`

Retrieves the current user's cart with populated product details.

#### Headers
```
Authorization: Bearer <token>
```

#### Response
```json
{
  "_id": "cart_id",
  "user": "user_id",
  "items": [
    {
      "product": {
        "_id": "product_id",
        "name": "Product Name",
        "price": 100,
        "image": "image_url",
        "stock": 10
      },
      "qty": 2,
      "_id": "item_id"
    }
  ],
  "createdAt": "2025-08-23T17:33:30.268Z",
  "updatedAt": "2025-08-23T17:33:30.268Z"
}
```

#### Empty Cart Response
```json
{
  "items": []
}
```

---

### 2. Add Item to Cart
**POST** `/api/cart`

Adds an item to the cart or increases quantity if item already exists.

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "productId": "68a943a1ef2aa7a5a7f094be",
  "quantity": 2
}
```

#### Response
Returns the updated cart with populated product details.

#### Error Responses
- `400 Bad Request`: Invalid product ID or quantity
- `404 Not Found`: Product not found
- `400 Bad Request`: Insufficient stock
- `401 Unauthorized`: Invalid or missing token

---

### 3. Update Cart Item Quantity
**PUT** `/api/cart`

Updates the quantity of an existing cart item. Setting quantity to 0 removes the item.

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "productId": "68a943a1ef2aa7a5a7f094be",
  "quantity": 5
}
```

#### Special Cases
- Setting `quantity: 0` removes the item from cart
- Quantity must be >= 0

#### Response
Returns the updated cart with populated product details.

#### Error Responses
- `400 Bad Request`: Invalid product ID or quantity
- `404 Not Found`: Cart or item not found
- `401 Unauthorized`: Invalid or missing token

---

### 4. Remove Item from Cart
**DELETE** `/api/cart/:productId`

Removes a specific item from the cart completely.

#### Headers
```
Authorization: Bearer <token>
```

#### URL Parameters
- `productId`: The ID of the product to remove

#### Response
Returns the updated cart with populated product details.

#### Error Responses
- `400 Bad Request`: Invalid product ID
- `404 Not Found`: Cart not found
- `401 Unauthorized`: Invalid or missing token

---

## Usage Examples

### JavaScript/Node.js with Axios

#### Get Cart
```javascript
const response = await axios.get('http://localhost:5001/api/cart', {
  headers: { Authorization: `Bearer ${token}` }
});
```

#### Add to Cart
```javascript
const response = await axios.post('http://localhost:5001/api/cart', {
  productId: '68a943a1ef2aa7a5a7f094be',
  quantity: 2
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

#### Update Cart Item
```javascript
const response = await axios.put('http://localhost:5001/api/cart', {
  productId: '68a943a1ef2aa7a5a7f094be',
  quantity: 5
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

#### Remove from Cart
```javascript
const response = await axios.delete(`http://localhost:5001/api/cart/${productId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### cURL Examples

#### Get Cart
```bash
curl -X GET \
  http://localhost:5001/api/cart \
  -H 'Authorization: Bearer your-jwt-token'
```

#### Add to Cart
```bash
curl -X POST \
  http://localhost:5001/api/cart \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "productId": "68a943a1ef2aa7a5a7f094be",
    "quantity": 2
  }'
```

#### Update Cart Item
```bash
curl -X PUT \
  http://localhost:5001/api/cart \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "productId": "68a943a1ef2aa7a5a7f094be",
    "quantity": 5
  }'
```

#### Remove from Cart
```bash
curl -X DELETE \
  http://localhost:5001/api/cart/68a943a1ef2aa7a5a7f094be \
  -H 'Authorization: Bearer your-jwt-token'
```

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

#### 400 Bad Request
```json
{
  "message": "Product ID and valid quantity required"
}
```

#### 404 Not Found
```json
{
  "message": "Product not found"
}
```

#### 500 Server Error
```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

## Data Models

### Cart Model
```javascript
{
  user: ObjectId (required, ref: "User"),
  items: [{
    product: ObjectId (required, ref: "Product"),
    qty: Number (required, default: 1)
  }],
  timestamps: true
}
```

### Product Model (Referenced)
```javascript
{
  name: String (required),
  price: Number (required),
  image: String,
  stock: Number (required),
  // ... other product fields
}
```

## Authentication Flow

1. **User Registration/Login**: Get JWT token
```javascript
const loginResponse = await axios.post('/api/users/login', {
  email: 'user@example.com',
  password: 'password'
});
const token = loginResponse.data.token;
```

2. **Use Token for Cart Operations**: Include in all cart requests
```javascript
const cartResponse = await axios.get('/api/cart', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Notes

- All cart operations are user-specific (based on JWT token)
- Cart automatically creates for new users when first item is added
- Stock validation is performed on add/update operations
- Items are populated with full product details in responses
- Cart persists across user sessions
- Quantity must be positive integers (except for updates where 0 removes item)

## Testing

Use the provided test file `completeCartTest.js` to verify all functionality:

```bash
node completeCartTest.js
```

This will test all cart endpoints with a new user registration and comprehensive cart operations.
