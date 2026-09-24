# NexusAdmin — Product Admin Dashboard

A responsive, modern Product Admin Dashboard built with **Next.js 16**, **React 19**, **Tailwind CSS**, and **Axios**, powered by the [DummyJSON API](https://dummyjson.com).

Designed and engineered for speed, clean architecture, and visual excellence without relying on heavy third-party table or query libraries like React Query or TanStack Table.

---

## 🚀 Live Demo & Repository
- **Live URL**: *(Deployable directly on Vercel / Netlify)*
- **GitHub Repository**: *(Push this repository to GitHub)*

---

## 🛠️ Tech Stack & Architecture Highlights

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **HTTP Client**: Axios (with centralized request/response interceptors)
- **State Management**: React Context (`AuthContext`, `ProductOverlayContext`, `ToastContext`) + Custom React Hooks (no React Query or SWR)
- **UI Architecture**: Modular component breakdown, zero third-party UI table/pagination libraries.

---

## 📋 Features Checklist & Implementation Details

| Feature | Requirement | Status | Implementation Details |
| :--- | :--- | :---: | :--- |
| **Authentication** | `POST /auth/login` with `emilys` / `emilyspass` | ✅ Completed | Form with validation, error banners, password visibility toggle, and one-click demo credentials auto-fill. |
| **Session & Route Guard** | Protected routes + Logout | ✅ Completed | Token saved in `localStorage` + cookie; request interceptor attaches `Authorization: Bearer <token>`; 401 interceptor auto-redirects; `<ProtectedRoute>` guards `/products/*`. |
| **Responsive Product List** | Table on desktop, Cards on mobile | ✅ Completed | Desktop shows full inventory table (thumbnails, title, category, price, discount, rating, stock badge, actions). Mobile displays touch-friendly cards. |
| **Custom Pagination** | `limit` & `skip`, page numbers, Prev/Next, page sizes (10, 20, 50) | ✅ Completed | "Showing 21–40 of 194 products", numbered pagination with smart ellipsis (`1 ... 4 5 6 ... 20`), page size selector. |
| **Debounced Search** | `/products/search?q=` with debounce | ✅ Completed | 400ms debounce hook (`useDebounce`). Resets to page 1 on query change. Inline clear button. |
| **Category Filter** | `/products/categories` | ✅ Completed | Dynamically fetched categories list + "All Categories" option. Resets to page 1 on selection. |
| **Multi-field Sorting** | Price, Rating, Title | ✅ Completed | Supports Ascending and Descending sorts for Price, Rating, and Title via DummyJSON `sortBy` & `order` parameters. |
| **Product Details Page** | `/products/[id]` | ✅ Completed | Image gallery with thumbnail preview strip, price with discount tag, stock & availability, specifications table, and customer reviews. |
| **Error Handling (404)** | Dedicated Not Found view for invalid IDs | ✅ Completed | Custom Not Found screen for invalid ID formats (e.g. `abc`, negative numbers) or non-existent IDs. |
| **Add, Edit, Delete** | Validated form + Delete confirmation popup | ✅ Completed | Client-side validation (title, category, price, stock, rating), double-submit protection, and confirmation modal before deleting. |
| **Mock Persistence Overlay** | Reflect simulated mutations in UI | ✅ Completed | `ProductOverlayContext` tracks local additions, edits, and deletions and merges them seamlessly with API responses. |
| **Race Condition Immunity** | Testable via `&delay=2000` | ✅ Completed | Implements `AbortController` cancellation on every query change + incremental request ID tracking. Stale delayed responses are safely discarded. |
| **URL State Synchronization** | Keep page, search, category, sort in URL | ✅ Completed | `useProductUrlParams` reads and writes query params (`page`, `limit`, `q`, `category`, `sortBy`, `order`). Refreshing or sharing URL preserves exact dashboard state. |
| **URL Resilience** | Malformed values like `?page=abc` | ✅ Completed | Safe parsing with sensible fallbacks (e.g. invalid page falls back to 1; out-of-range pages clamped without crashing). |
| **Double-submit Protection** | Rapid clicking Save or Login | ✅ Completed | `isSubmitting` / `isDeleting` flags disable action buttons and display loading spinners during active requests. |
| **Feedback & Notifications** | Loaders, empty states, error retry, toasts | ✅ Completed | Skeleton loaders for table & cards, empty state with filter reset, error banner with Retry button, and auto-dismissing toast notifications. |
| **Indian Rupees & Multi-Currency** | Convert $ to Indian Rupees (₹) with live conversion & toggle | ✅ Completed | Default currency set to INR (₹) with `en-IN` formatting (1 USD ≈ ₹83), plus interactive navbar currency switcher with live switching and 1:1 option. |

---

## 🧠 Architectural Decisions & Technical Answers

### 1. Handling the DummyJSON Category + Search API Limitation
* **The Problem**: DummyJSON does not support simultaneous search and category filtering on the backend. Calling `/products/search?q=phone&category=smartphones` ignores the category filter entirely, while calling `/products/category/smartphones?q=phone` ignores the search parameter.
* **Our Solution**:
  When a user applies **both** a category and a search keyword:
  1. The app queries `/products/category/{category}` with a higher limit to fetch the category's product set.
  2. It then performs client-side case-insensitive text matching against title, description, and brand.
  3. The resulting subset is paginated according to the current `limit` and `skip`.
  4. The UI displays an informational badge: *"Hybrid Search Active: Filtering category '{category}' by '{q}' client-side"*.
  This provides an intuitive, uninterrupted user experience without dropping either filter.

### 2. Mock API Persistence for Add, Edit, and Delete
* **The Problem**: DummyJSON's API endpoints (`POST /products/add`, `PUT /products/[id]`, `DELETE /products/[id]`) return mock HTTP 200/201 responses but do not actually persist mutations in DummyJSON's database.
* **Our Solution**:
  1. Real HTTP requests are always dispatched via Axios to satisfy the requirement that all API calls go through the shared Axios client.
  2. A lightweight client-side persistence overlay (`ProductOverlayContext`) stores:
     - `addedProducts` (new products created during the session)
     - `updatedProducts` (dictionary mapping `id -> updatedFields`)
     - `deletedProductIds` (set of deleted product IDs)
  3. Whenever product data is fetched (in list, search, category, or detail view), our overlay pipeline filters out deleted items, merges edits, and prepends newly created products.
  4. A **"Reset Demo Changes"** button in the navbar allows resetting back to clean API state at any time.

### 3. Bulletproof Race Condition Prevention
* **The Problem**: When typing quickly or when network responses return out-of-order (such as with artificial delays like `&delay=2000`), a slower previous search request might resolve after a faster newer request, overwriting current results.
* **Our Solution**:
  - We use React's `AbortController` within `useProductsQuery`. Whenever a new search or filter request begins, the in-flight controller is aborted (`abortController.abort()`).
  - An incremental `latestRequestIdRef` sequence counter ensures that even if an aborted request resolves, its payload is immediately rejected if its sequence ID does not match the active request.

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node.js v24.x)
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd "Frontend Assignment"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
```bash
npm run build
npm start
```

---

## 🔑 Demo Account Credentials
- **Username**: `emilys`
- **Password**: `emilyspass`
*(A convenient **"Auto-fill"** button is also provided on the login page for instant testing)*

---

## 📝 Reflection Note

### Design Choices
- **Minimal Dependencies**: Strictly avoided external table, pagination, or query libraries. All debouncing, AbortControllers, and state synchronization were handwritten with clean, reusable hooks.
- **Aesthetics**: Built with a sleek dark slate color palette (`#020617`), modern translucent glassmorphism cards, clear visual hierarchy, accessible badge colors for stock and discounts, and responsive adaptations between desktop tables and mobile cards.

### Challenge Faced & Resolution
- **Challenge**: The race condition where an older delayed query (`&delay=2000`) could resolve after a user has typed a new keyword.
- **Resolution**: Implemented a two-tiered defense: first, canceling the Axios request using `AbortController` in the request config; second, verifying against an incremental request sequence ID (`latestRequestIdRef`) before updating React state.

### Role of AI Tools
- AI tools assisted in drafting boilerplate types matching the DummyJSON API response schemas, refining Tailwind utility combinations for responsive layouts, and designing the hybrid search strategy for DummyJSON's API limitation. All logic, error handling, state hooks, and components were reviewed, customized, and verified for production standards.
