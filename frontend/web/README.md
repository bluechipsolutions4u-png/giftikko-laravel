# Betty Web - Customer-Facing Website

A modern Next.js website for browsing and purchasing products from Betty's catalog.

## 🚀 Features

- **Homepage**: Beautiful hero section and product grid
- **Product Display**: Fetch products from Laravel backend API
- **Login Page**: User authentication
- **Responsive Design**: Mobile-first responsive layout with Tailwind CSS
- **Modern UI**: Gradient backgrounds, smooth animations, and hover effects
- **Image & Video Support**: Display products with images (JPG, PNG, WEBP) or videos (MP4)

## 📁 Structure

```
web/
├── app/
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout with Header/Footer
│   └── page.tsx              # Homepage
├── components/
│   ├── Header.tsx            # Navigation header
│   ├── Footer.tsx            # Footer with links
│   └── ProductCard.tsx       # Product card component
└── .env.local                # Environment variables
```

## 🔧 Setup

### 1. Install Dependencies
```bash
cd c:\xampp\betty\frontend\web
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The website will be available at `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
npm start
```

## 🌐 Pages

### Home (`/`)
- Hero section with call-to-action buttons
- Product grid displaying all products from database
- Features section highlighting key benefits
- Loads products from `/api/products` endpoint

### Login (`/login`)
- Email and password login form
- Password visibility toggle
- Form validation and error handling
- Connects to `/api/login` endpoint

## 🎨 Design

The website is inspired by modern e-commerce sites like omgs.in, featuring:
- **Gradient Backgrounds**: Blue, purple, and pink gradients
- **Smooth Animations**: Fade-in, slide-up, and hover effects
- **Card-based Layout**: Product cards with hover zoom effects
- **Modern Typography**: Inter font for clean, readable text
- **Responsive Grid**: 1-4 columns based on screen size

## 🔗 API Integration

The website connects to the Laravel backend at `http://127.0.0.1:8000/api`

### Endpoints Used:
- `GET /api/products` - Fetch all products (public)
- `POST /api/login` - User authentication

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (1 column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (3-4 columns)

## 🎯 Next Steps (To be implemented)

- [ ] Cart functionality
- [ ] Product detail pages
- [ ] User registration
- [ ] Order placement
- [ ] User profile/dashboard
- [ ] Search and filters
- [ ] Wishlist
- [ ] Checkout process

## 🔐 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## 📝 Notes

- Make sure the Laravel backend is running on port 8000
- Products must be added through the admin panel first
- Images/videos are served from Laravel's storage
- No authentication required for browsing products

---

Built with ❤️ using Next.js 15, TypeScript, and Tailwind CSS
