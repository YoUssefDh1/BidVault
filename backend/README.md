# Bidding Site Backend API

A real-time auction platform backend built with **FastAPI**, providing comprehensive REST API endpoints for managing auctions, products, bids, and user authentication.

## Tech Stack

- **Framework**: FastAPI 0.111.0
- **Web Server**: Uvicorn
- **Database**: SQLAlchemy (SQLite)
- **Authentication**: python-jose with JWT tokens
- **Password Hashing**: bcrypt via passlib
- **File Upload**: python-multipart
- **Validation**: Pydantic

## Project Structure

```
backend/
├── main.py                  # FastAPI application setup
├── auth.py                  # Authentication utilities (JWT, password hashing)
├── database.py              # Database configuration and session management
├── models.py                # SQLAlchemy ORM models
├── schemas.py               # Pydantic request/response schemas
├── ws_manager.py            # WebSocket connection management
├── requirements.txt         # Python dependencies
├── routers/                 # API endpoint routers
│   ├── auth.py             # Authentication endpoints
│   ├── users.py            # User management endpoints
│   ├── categories.py       # Category endpoints
│   ├── products.py         # Product endpoints
│   ├── auctions.py         # Auction management endpoints
│   ├── bids.py             # Bidding endpoints
│   └── admin.py            # Admin endpoints
├── uploads/                # User-uploaded files
│   └── products/           # Product images
└── Utility Scripts:
    ├── create_admin.py     # Create admin user
    ├── seed_categories.py  # Populate initial categories
    ├── seed_products.py    # Populate test products
    ├── seed_images.py      # Associate product images
    ├── migrate_add_favourites.py  # Database migration
    └── reset_auction_dates.py     # Reset auction dates
```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Initialize Database

The database is automatically created on first run, but you can set up initial data:

```bash
# Create admin user
python create_admin.py

# Seed categories (optional)
python seed_categories.py

# Seed test products (optional)
python seed_products.py

# Associate product images (optional)
python seed_images.py
```

### 3. Run the Server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

**API Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and receive JWT token
- `POST /auth/refresh` - Refresh access token

### Users (`/users`)
- `GET /users/{user_id}` - Get user profile
- `PUT /users/{user_id}` - Update user profile
- `GET /users/{user_id}/favourites` - Get user's favourite products
- `POST /users/{user_id}/favourites` - Add product to favourites
- `DELETE /users/{user_id}/favourites/{product_id}` - Remove from favourites

### Categories (`/categories`)
- `GET /categories` - List all categories
- `GET /categories/{id}` - Get category details
- `POST /categories` - Create category (admin only)
- `PUT /categories/{id}` - Update category (admin only)
- `DELETE /categories/{id}` - Delete category (admin only)

### Products (`/products`)
- `GET /products` - List all products with filtering
- `GET /products/{id}` - Get product details
- `POST /products` - Create new product (admin only)
- `PUT /products/{id}` - Update product (admin only)
- `DELETE /products/{id}` - Delete product (admin only)
- `POST /products/{id}/image` - Upload product image

### Auctions (`/auctions`)
- `GET /auctions` - List all auctions
- `GET /auctions/{id}` - Get auction details
- `POST /auctions` - Create new auction (admin only)
- `PUT /auctions/{id}` - Update auction (admin only)
- `GET /auctions/{id}/bids` - Get auction bids
- `WS /auctions/{id}/ws` - WebSocket for real-time auction updates

### Bids (`/bids`)
- `POST /bids` - Place a bid
- `GET /bids/user` - Get user's bids

### Admin (`/admin`)
- `GET /admin/stats` - Get platform statistics
- `GET /admin/users` - List all users
- `POST /admin/auction/reset` - Reset auction dates

## Authentication

The API uses JWT-based authentication:

1. **Register/Login**: Obtain JWT token via `/auth/register` or `/auth/login`
2. **Include Token**: Add `Authorization: Bearer <token>` header to protected endpoints
3. **Token Refresh**: Use `/auth/refresh` to get a new token before expiration

Protected endpoints will return `401 Unauthorized` without valid token.

## File Uploads

Product images are uploaded via multipart form data:

```bash
POST /products/{id}/image
Content-Type: multipart/form-data

file: <image_file>
```

Uploaded images are served as static files at `/uploads/products/`

## Real-Time Features

WebSocket endpoint for live auction updates:

```
WS ws://localhost:8000/auctions/{auction_id}/ws
```

Connect to receive real-time bid updates and auction status changes.

## CORS Configuration

The backend is configured to accept requests from `http://localhost:5173` (React dev server). Update the `CORS_ORIGINS` in `main.py` when deploying to production.

## Database

- **Type**: SQLite (default configuration)
- **Location**: Auto-created in project directory
- **Models**: User, Category, Product, Auction, Bid, Favourite

Database tables are automatically created on application startup via SQLAlchemy.

## Environment Variables

Currently configured with defaults. For production, consider adding:
- `SECRET_KEY` - JWT secret key
- `DATABASE_URL` - Database connection string
- `CORS_ORIGINS` - Allowed origins for CORS

## Troubleshooting

### Port Already in Use
```bash
# Use different port
uvicorn main:app --reload --port 8001
```

### Database Issues
```bash
# Reset database (deletes all data)
rm *.db
python create_admin.py
```

### CORS Errors
Ensure the frontend URL in `main.py` CORS configuration matches your frontend's URL.

## Development

The server runs in development mode with `--reload` flag, which automatically restarts when code changes are detected.

For debugging, use FastAPI's built-in documentation at `/docs` to test endpoints interactively.

## Notes

- All timestamps are in UTC
- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire after configured duration
- WebSocket connections close on server restart
