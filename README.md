# Odoo Hackathon 2025 
# Team name: Orcles-Seeing Beyond the Bug
# Problem statement: 3. ReWear – Community Clothing Exchange
# ReWear - Community Clothing Exchange Platform

A sustainable fashion platform that enables users to exchange unused clothing through direct swaps or a point-based redemption system, promoting textile waste reduction and encouraging garment reuse.

##  Mission

ReWear aims to revolutionize how we think about fashion consumption by creating a community-driven platform where clothing gets a second life, reducing textile waste and promoting sustainable fashion practices.

##  Features

### Core Functionality
- **User Authentication**: Secure email/password signup and login system
- **Direct Swaps**: Person-to-person clothing exchanges
- **Point-Based System**: Earn and redeem points for clothing items
- **Item Management**: Easy listing and browsing of available items
- **Admin Moderation**: Content oversight and quality control

### User Experience
- **Landing Page**: Platform introduction with featured items carousel
- **User Dashboard**: Personal profile, points balance, and swap history
- **Item Detail Pages**: Comprehensive item information and exchange options
- **Easy Listing**: Streamlined process for adding new items
- **Admin Panel**: Lightweight moderation tools for platform oversight

##  Target Users

- **Fashion-conscious individuals** looking to refresh their wardrobe sustainably
- **Environmentally aware consumers** wanting to reduce textile waste
- **Budget-conscious shoppers** seeking affordable clothing options
- **Minimalists** looking to declutter while helping others

##  Platform Structure

### Landing Page
- Platform introduction and value proposition
- Call-to-action buttons: "Start Swapping", "Browse Items", "List an Item"
- Featured items carousel showcasing popular exchanges
- User testimonials and community highlights

### User Dashboard
- Personal profile management
- Current points balance display
- Overview of uploaded items with status indicators
- Ongoing and completed swaps history
- Quick access to common actions

### Item Detail Page
- High-quality image gallery
- Comprehensive item description
- Uploader information and ratings
- Exchange options: "Swap Request" or "Redeem via Points"
- Real-time availability status
- Community reviews and ratings

### Add New Item Page
- Multi-image upload functionality
- Detailed item information form:
  - Title and description
  - Category and type selection
  - Size and condition assessment
  - Relevant tags for discoverability
- Item listing submission and review process

### Admin Panel
- Item moderation queue
- Approve/reject item listings
- Remove inappropriate or spam content
- User management and platform oversight
- Analytics and reporting dashboard

##  Technical Stack


### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and enhanced developer experience
- **Tailwind CSS** - Utility-first styling with custom design system
- **Lucide React** - Beautiful, consistent icon library
- **React Router** - Client-side routing and navigation
- **React Hook Form** - Performant form handling with validation
- **Yup** - Schema validation for forms

### Backend & Services
- **Google Apps Script** - Serverless backend with JavaScript
- **Google Sheets** - Simple database using Google Sheets
- **Google Drive** - File storage for images and documents
- **Google Cloud** - Hosting and infrastructure

### Development Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting and quality enforcement
- **TypeScript** - Static type checking and IntelliSense
- **PostCSS** - CSS processing and optimization

##  Design & Mockups

View the platform mockups and design specifications: [Excalidraw Mockup](https://app.excalidraw.com/l/65VNwvy7c4X/zEqG7IJrg0)

##  Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aditee0211/Orcles-Seeing-Beyond-the-Bug.git
   cd rewear
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Google Apps Script Setup**
   - Create a Google Sheets database (see `GOOGLE_APPS_SCRIPT_SETUP.md`)
   - Set up Google Apps Script backend
   - Deploy as web app
   - Copy the web app URL

4. **Configure Environment Variables**
   
   Create a `.env` file in the root directory with your configuration:
   ```bash
   # Google Apps Script Configuration
   VITE_APPS_SCRIPT_URL=YOUR_WEB_APP_URL_HERE
   
   # Development Settings
   VITE_APP_ENV=development
   VITE_APP_NAME=ReWear
   ```
   
   **Important**: Replace `YOUR_WEB_APP_URL_HERE` with your actual Google Apps Script web app URL.

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

##  Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Header, Footer, Navigation
│   └── ProtectedRoute.tsx
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication state management
├── lib/               # External service configurations
│   └── appsScriptService.ts # Google Apps Script service layer
├── pages/             # Main application pages
│   ├── Home.tsx       # Landing page with featured items
│   ├── Login.tsx      # User authentication
│   ├── Register.tsx   # User registration
│   ├── Dashboard.tsx  # User profile and activity
│   ├── Browse.tsx     # Item browsing with filters
│   ├── ItemDetail.tsx # Detailed item view
│   ├── AddItem.tsx    # Add new item form
│   ├── Admin.tsx      # Admin panel
│   └── Search.tsx     # Search results page
├── types/             # TypeScript type definitions
│   └── index.ts       # Core data models
├── App.tsx            # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles with Tailwind
```



##  Contributing

We welcome contributions to ReWear! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Roadmap

- [ ] User authentication system
- [ ] Basic item listing and browsing
- [ ] Point-based exchange system
- [ ] Direct swap functionality
- [ ] Admin moderation panel
- [ ] Mobile responsive design
- [ ] User ratings and reviews
- [ ] Advanced search and filtering
- [ ] Social features and community building

##  Contact

For questions, suggestions, or support:
- Email: [oracalesseeingbeyondthebug@gmail.com]

