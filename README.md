# 🍺 BudBeer Admin Panel

Modern React admin panel for managing bar submissions with approval workflow.

## Features

- ✅ Admin authentication
- ✅ Dashboard with statistics
- ✅ Review pending bar submissions
- ✅ Approve/reject/delete bars
- ✅ IP ban management
- ✅ Beautiful, responsive UI

## Tech Stack

- **React 18**
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** with modern styling

## Installation

1. **Navigate to the AdminPanel folder:**
   ```bash
   cd AdminPanel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The admin panel will open at `http://localhost:3000`

## Configuration

The API URL is configured in `src/config.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://budbeer-api.onrender.com/api';
```

To change the API endpoint, create a `.env` file:

```env
REACT_APP_API_URL=https://budbeer-api.onrender.com/api
```

## Default Credentials

- **Username:** `admin`
- **Password:** `admin`

⚠️ **Important:** Change these credentials in production!

## Usage

### Login
1. Open the admin panel
2. Enter username and password
3. Click "Login"

### Dashboard Overview
The dashboard shows:
- Number of pending bars
- Number of approved bars
- Number of rejected bars
- Number of banned IPs

### Managing Bars

#### Pending Tab
- View all bars waiting for approval
- Click "✓ Approve" to approve a bar
- Click "✗ Reject" to reject a bar
- Click "🗑 Delete" to permanently remove a bar

#### Approved Tab
- View all approved bars (visible to users)
- Reject or delete bars if needed

#### Rejected Tab
- View all rejected bars
- Re-approve or delete if needed

### IP Management

#### Banned IPs Tab
- View all banned IP addresses
- Ban new IPs with optional reason
- Unban IPs to restore access

## Components Structure

```
src/
├── components/
│   ├── Login.js              # Login page
│   ├── Login.css
│   ├── Dashboard.js          # Main dashboard
│   ├── Dashboard.css
│   ├── BarCard.js           # Individual bar card
│   ├── BarCard.css
│   ├── BannedIPsManager.js  # IP ban management
│   └── BannedIPsManager.css
├── App.js                    # Main app with routing
├── App.css
├── config.js                 # API configuration
└── index.js                  # App entry point
```

## Building for Production

```bash
# Create optimized production build
npm run build
```

The build files will be in the `build/` folder.

## Deployment

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

### Option 2: Netlify
1. Run `npm run build`
2. Upload `build/` folder to Netlify
3. Set environment variables if needed

### Option 3: Traditional hosting
1. Run `npm run build`
2. Upload contents of `build/` folder to your web server
3. Configure web server to serve `index.html` for all routes

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: `https://budbeer-api.onrender.com/api`; use `http://localhost:3000/api` for local API)

## Features in Detail

### Authentication
- JWT token-based authentication
- Token stored in localStorage
- Auto-redirect if not authenticated
- Secure logout

### Bar Management
- View bar details (name, location, price, submission time, IP)
- Multiple actions per bar based on status
- Instant UI updates after actions

### IP Banning
- Ban IPs with optional reason
- View ban history with timestamps
- Quick unban functionality

### Responsive Design
- Works on desktop, tablet, and mobile
- Adaptive grid layouts
- Touch-friendly buttons

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## API Integration

The admin panel communicates with the BudBeer API. Make sure the API is running before using the admin panel.

Required API endpoints:
- `POST /api/admin/login`
- `GET /api/admin/stats`
- `GET /api/admin/bars?status=...`
- `PATCH /api/admin/bars/:id/approve`
- `PATCH /api/admin/bars/:id/reject`
- `DELETE /api/admin/bars/:id`
- `GET /api/admin/banned-ips`
- `POST /api/admin/banned-ips`
- `DELETE /api/admin/banned-ips/:ip`

## Troubleshooting

### CORS Errors
Make sure the API has CORS enabled and allows requests from your admin panel domain.

### Authentication Issues
- Check that the API is running
- Verify the API URL in `config.js`
- Clear localStorage and try logging in again

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## License

MIT

