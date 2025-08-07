# Healthcare Worker Clock-In App

A comprehensive web application for healthcare workers to clock in/out of shifts with location-based restrictions and manager oversight.

## 🚀 Features

### 👨‍💼 Manager Features
- **Perimeter Management**: Set organization location and radius (e.g., within 2km) where care workers can clock in
- **Staff Monitoring**: View all currently clocked-in staff in real-time
- **Complete History**: Detailed table showing when and where each staff member clocked in/out
- **Analytics Dashboard**: 
  - Average hours per day across all staff
  - Daily clock-in counts
  - Weekly hours per staff member with charts
  - Real-time statistics

### 👩‍⚕️ Care Worker Features
- **Location-Based Clock In**: Can only clock in when within the set perimeter
- **Clock Out**: Clock out from anywhere when already clocked in
- **Optional Notes**: Add notes when clocking in/out
- **Perimeter Alerts**: Clear feedback when outside allowed area
- **Shift History**: View personal clock-in/out history
- **Real-time Location**: Automatic location detection and tracking

### 🔐 Authentication & Security
- **Auth0 Integration**: Secure authentication with Google and email login
- **Role-Based Access**: Separate interfaces for managers and care workers
- **Manager Authentication**: Additional manager login system for dashboard access
- **Session Management**: Secure session handling and logout

### 📱 UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Ant Design**: Clean, professional interface using Ant Design components
- **Real-time Updates**: Live data updates without page refresh
- **Intuitive Navigation**: Easy-to-use tabbed interface for managers
- **Visual Feedback**: Clear status indicators and notifications

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with React
- **UI Library**: Ant Design
- **Authentication**: Auth0
- **Database**: PostgreSQL with Prisma ORM
- **API**: GraphQL with Apollo Client
- **Charts**: Chart.js with react-chartjs-2
- **Deployment**: Ready for Vercel/Netlify deployment

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Auth0 account
- Modern web browser with location services

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd healthcare-clock-app
npm install
```

### 2. Environment Setup
Create `.env.local` file:
```env
# Auth0 Configuration
AUTH0_SECRET='your-auth0-secret'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/healthcare_db"

# GraphQL
GRAPHQL_ENDPOINT="http://localhost:3000/api/graphql"

# Manager Login Credentials
MANAGER_EMAIL=manager@example.com
MANAGER_PASSWORD=yourStrongPassword
```

### 3. Database Setup
```bash
npx prisma db push
npx prisma generate
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📖 Usage Guide

### For Care Workers
1. **Login**: Sign in using Auth0 (Google or email)
2. **Location**: Allow location access when prompted
3. **Clock In**: Click "Clock In" when within the work perimeter
4. **Add Notes**: Optionally add notes about your shift
5. **Clock Out**: Click "Clock Out" when ending your shift
6. **History**: View your shift history in the Recent Activity section

### For Managers
1. **Manager Login**: Access `/manager/login` with manager credentials
2. **Dashboard**: View real-time analytics and currently clocked-in staff
3. **Staff Management**: See complete clock history for all staff
4. **Settings**: Configure organization location and perimeter radius
5. **Individual Staff**: Click on any staff member to view detailed history

## 🔧 Configuration

### Setting Up Perimeter
1. Login as manager
2. Go to Settings tab
3. Click "Edit Perimeter Settings"
4. Enter:
   - Organization name
   - Latitude and longitude coordinates
   - Radius in kilometers (e.g., 2.0 for 2km)
5. Save settings

### Getting Coordinates
- Use Google Maps: Right-click → "What's here?" → Copy coordinates
- Use GPS coordinates from your phone
- Example: New York City = `40.7128, -74.0060`

## 🏗 Architecture

### Database Schema
- **Users**: Auth0 integration with roles (MANAGER/CARE_WORKER)
- **Organizations**: Location and perimeter settings
- **ClockRecords**: Timestamp, location, notes, and type (IN/OUT)

### API Endpoints
- `/api/auth/*`: Auth0 authentication routes
- `/api/graphql`: GraphQL API for all data operations
- `/api/manager-login`: Manager authentication endpoint

### Key Components
- `ManagerDashboard`: Comprehensive manager interface with tabs
- `CareWorkerDashboard`: Mobile-friendly clock in/out interface
- `LoginPage`: Auth0 integration with attractive design
- `Navigation`: Role-based navigation component

## 📊 Analytics Features

### Dashboard Metrics
- **Average Hours/Day**: Calculated across all staff
- **Daily Clock-ins**: Number of people clocking in each day
- **Weekly Hours**: Total hours per staff over last 7 days
- **Currently Active**: Real-time count of clocked-in staff

### Visual Charts
- Bar chart showing weekly hours per staff member
- Responsive design with Chart.js integration
- Interactive tooltips and legends

## 🔒 Security Features

- **Location Validation**: Server-side perimeter checking
- **Role-Based Access**: Managers and care workers see different interfaces
- **Secure Sessions**: HTTP-only cookies for manager authentication
- **Input Validation**: All forms validated on client and server
- **Error Handling**: Comprehensive error messages and logging

## 📱 Mobile Optimization

- **Responsive Layout**: Adapts to all screen sizes
- **Touch-Friendly**: Large buttons and easy navigation
- **Location Services**: Seamless GPS integration
- **Offline Handling**: Graceful degradation when offline
- **PWA Ready**: Can be installed as a mobile app

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Setup
- Use Neon, Supabase, or any PostgreSQL provider
- Update `DATABASE_URL` in environment variables
- Run `npx prisma db push` after deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or support, contact: career@lief.care

## 📄 License

This project is licensed under the MIT License.

---

## 🎯 MVP Features Completed

✅ **Manager Features**
- Set location perimeter (latitude, longitude, radius)
- View all clocked-in staff in real-time
- Complete clock history table with timestamps and locations
- Analytics dashboard with charts and statistics

✅ **Care Worker Features**
- Location-based clock in (within perimeter only)
- Clock out from anywhere when clocked in
- Optional notes for both clock in and out
- Clear perimeter violation messages
- Personal shift history

✅ **Authentication**
- Auth0 integration with Google and email login
- User registration and account management
- Role-based access control
- Secure session management

✅ **UI/UX**
- Ant Design components throughout
- Responsive design for mobile and desktop
- Clean, professional interface
- Intuitive navigation and user flow

The application is production-ready and includes all requested MVP features with room for future enhancements.
