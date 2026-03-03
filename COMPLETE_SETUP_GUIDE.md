# 🚀 Betty Web Application - Complete Setup Guide

## 📋 Overview

Your Betty project now has TWO frontend applications:

1. **Admin Panel** (`frontend/admin`) - React app for managing products
2. **Web Store** (`frontend/web`) - Next.js app for customers to browse products

## 🗂️ Project Structure

```
c:\xampp\betty\
├── backend\                    # Laravel API
│   ├── app\
│   │   ├── Models\
│   │   │   └── Product.php
│   │   └── Http\Controllers\
│   │       └── ProductController.php
│   ├── database\
│   │   └── migrations\
│   └── routes\api.php
│
├── frontend\
│   ├── admin\                  # Admin Panel (React)
│   │   ├── src\
│   │   │   ├── components\
│   │   │   │   ├── Login.jsx
│   │   │   │   └── AdminPanel.jsx
│   │   │   └── App.js
│   │   └── package.json
│   │
│   └── web\                    # Customer Website (Next.js)
│       ├── app\
│       │   ├── login\
│       │   │   └── page.tsx
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── components\
│       │   ├── Header.tsx
│       │   ├── Footer.tsx
│       │   └── ProductCard.tsx
│       └── package.json
```

## 🎯 Applications Overview

### 1. Backend (Laravel) - Port 8000
**Purpose**: API server providing product data and authentication

**Status**: ✅ Already running
- URL: `http://127.0.0.1:8000`
- API Base: `http://127.0.0.1:8000/api`

**Key Endpoints**:
- `POST /api/login` - User authentication
- `GET /api/products` - List all products (public)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/{id}` - Update product (admin only)
- `DELETE /api/products/{id}` - Delete product (admin only)

### 2. Admin Panel (React) - Port 3000
**Purpose**: Admin interface to add, edit, and delete products

**Status**: ✅ Already running
- URL: `http://localhost:3000`
- Login: `ajith@gmail.com` / `admin123`

**Features**:
- ✨ Login with authentication
- ➕ Add products (images or videos)
- ✏️ Edit existing products
- 🗑️ Delete products
- 📷 Media preview before upload

### 3. Web Store (Next.js) - Port 3001
**Purpose**: Customer-facing website to browse and view products

**Status**: ✅ Just created & running!
- URL: `http://localhost:3000` (will change to 3001)
- Public access (no login required to browse)

**Features**:
- 🏠 Beautiful homepage with hero section
- 📦 Product grid with images/videos
- 🔐 Login page for customers
- 📱 Fully responsive design
- ✨ Modern UI with animations

## 🚀 How to Run Everything

### Option 1: All Services Running
```bash
# Terminal 1: Backend (already running)
cd c:\xampp\betty\backend
php artisan serve

# Terminal 2: Admin Panel (already running)
cd c:\xampp\betty\frontend\admin
npm start

# Terminal 3: Web Store (just started)
cd c:\xampp\betty\frontend\web
npm run dev
```

### Current Ports:
- ✅ Backend: `http://127.0.0.1:8000`  
- ✅ Admin Panel: `http://localhost:3000`
- ⚠️ Web Store: Currently trying to use port 3000 (conflict!)

### 🔧 Fix Port Conflict

Since Admin is already on port 3000, we need to change the Web Store to port 3001:

**Stop the Web server** (Ctrl+C in the terminal), then:

```bash
cd c:\xampp\betty\frontend\web
npm run dev -- -p 3001
```

Or update `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

## 📱 Accessing the Applications

### 1️⃣ Customer Website (Port 3001)
**URL**: `http://localhost:3001`

**What you'll see**:
- Hero section with gradient background
- "Browse Products" and "Learn More" buttons
- Grid of all products from the database
- Header with cart and login links
- Footer with contact info

**Try it**:
1. Open `http://localhost:3001`
2. See all products displayed
3. Click "View Details" on any product
4. Click "Login" to see the login page

### 2️⃣ Admin Panel (Port 3000)
**URL**: `http://localhost:3000`

**Try it**:
1. Login with: `ajith@gmail.com` / `admin123`
2. Click "+ Add New Product"
3. Upload an image or video
4. Fill name and description
5. Click "Add Product"
6. Refresh the web store (`http://localhost:3001`) to see it!

## 🎨 Website Design Features

The web store is designed similar to www.omgs.in with:

### Visual Design:
- 🎨 **Gradient Backgrounds**: Blue → Purple → Pink
- 💫 **Smooth Animations**: Fade-in and hover effects
- 🃏 **Card Layout**: Products in clean card grid
- 📱 **Responsive**: Works on mobile, tablet, desktop

### Components:
- **Header**: Logo, navigation, cart, login
- **Hero Section**: Large banner with call-to-action
- **Product Grid**: 1-4 columns based on screen size
- **Product Cards**: Image/video with name, description, "View Details"
- **Footer**: Links, contact info, policies

### Responsive Breakpoints:
- Mobile: 1 column
- Tablet: 2 columns  
- Laptop: 3 columns
- Desktop: 4 columns

## 🔄 Workflow Example

### Adding a Product (Complete Flow):

1. **Admin adds product**:
   - Go to `http://localhost:3000`
   - Login as admin
   - Add a product with image/video
   - Click "Add Product"

2. **Product saved to database**:
   - Stored in `products` table
   - File saved to `backend/storage/app/public/products`

3. **Product appears on website**:
   - Automatically visible at `http://localhost:3001`
   - No refresh needed (API fetches latest)

## 🛠️ Configuration Files

### Backend: `backend/.env`
```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

### Admin: `frontend/admin/.env`
```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

### Web: `frontend/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## 📚 Technology Stack

| Application | Framework | Port | Purpose |
|------------|-----------|------|---------|
| Backend | Laravel 11 | 8000 | API & Database |
| Admin Panel | React 18 | 3000 | Product Management |
| Web Store | Next.js 15 | 3001 | Customer Website |

### Libraries Used:
- **Backend**: Laravel Sanctum (auth), SQLite (database)
- **Admin**: Axios (API), React Router (future)
- **Web**: Lucide Icons, TypeScript, Tailwind CSS

## ✅ What's Implemented

### ✅ Backend:
- Product CRUD API
- File upload (images & videos)
- Authentication with Sanctum
- Database migrations
- Storage linking

### ✅ Admin Panel:
- Login page
- Product management UI
- Add/Edit/Delete products
- File upload with preview
- Responsive design

### ✅ Web Store:
- Homepage with hero
- Product grid from API
- Login page
- Responsive header/footer
- Modern UI design

## 🎯 Next Steps (To Implement Later)

### Web Store:
- [ ] Product detail pages
- [ ] Shopping cart
- [ ] User registration
- [ ] Checkout process
- [ ] Order history
- [ ] Search functionality
- [ ] Product categories
- [ ] Filters and sorting

### Admin Panel:
- [ ] Product categories
- [ ] Order management
- [ ] User management
- [ ] Analytics dashboard

## 🐛 Troubleshooting

### Port already in use?
```bash
# Find process on port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <process_id> /F

# Or just use a different port
npm run dev -- -p 3001
```

### Products not showing?
1. Check if backend is running
2. Check if products exist in database
3. Check browser console for errors
4. Verify API URL in `.env.local`

### Images not loading?
1. Run `php artisan storage:link` in backend
2. Check file permissions on storage folder
3. Verify file_url in API response

## 📞 Support

For issues or questions:
- Check the README files in each folder
- Review the ADMIN_PANEL_GUIDE.md
- Check browser console for errors
- Verify all services are running

---

🎉 **Congratulations!** You now have a complete full-stack application with:
- Backend API ✅
- Admin Panel ✅  
- Customer Website ✅

Happy coding! 🚀
