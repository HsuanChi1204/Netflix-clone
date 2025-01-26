# Netflix Clone

A full-stack Netflix clone built with the MERN stack (MongoDB, Express.js, React.js, Node.js), featuring user authentication, movie browsing, favorites management, and a comment system.

## 📸 Screenshots

### Home Page
![Home Page](.github/assets/home-preview.png)

### Movie Details with Comments
![Movie Details](.github/assets/movie-detail.png)

### Favorites List
![Favorites List](.github/assets/favorites-list.png)

## 🚀 Features

- **User Authentication**
  - JWT-based authentication
  - Secure password hashing
  - Protected routes

- **Movie Experience**
  - Browse movies by categories
  - Watch movie trailers
  - Search functionality
  - Responsive video player

- **Interactive Features**
  - Add/remove favorites
  - Comment system with ratings
  - Personal watchlist
  - Dynamic UI updates

- **Modern UI/UX**
  - Netflix-like interface
  - Responsive design
  - Smooth animations
  - Loading states

## 🛠 Technology Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Icons** - Icon components
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### DevOps & Testing
- **Docker** - Containerization
- **Jest** - Testing
- **GitHub Actions** - CI/CD
- **ESLint** - Code linting

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/HsuanChi1204/Netflix-clone.git
cd Netflix-clone
```

2. Install dependencies
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Environment Setup

Create `.env` files in both client and server directories:

```bash
# server/.env
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# client/.env
VITE_API_URL=http://localhost:5001
```

4. Start Development Servers

```bash
# Start backend server
cd server
npm run dev

# Start frontend in a new terminal
cd client
npm run dev
```

## 📁 Project Structure
```
Netflix-clone/
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── assets/       # Static assets
│   │   └── App.jsx       # Main application
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── middlewares/  # Custom middlewares
│   └── package.json
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites

### Comments
- `GET /api/comments/:movieId` - Get movie comments
- `POST /api/comments` - Add comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## 🔒 Environment Variables

### Backend
```env
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### Frontend
```env
VITE_API_URL=http://localhost:5001
```

## 🛡 Security Features
- JWT authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation
- XSS protection
- CORS configuration

## 🚧 Future Improvements
- [ ] Add social authentication
- [ ] Implement infinite scrolling
- [ ] Add user profiles
- [ ] Enhance search functionality
- [ ] Add more interactive features
- [ ] Implement real-time updates

## 👥 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- [TMDB API](https://www.themoviedb.org/documentation/api) for movie data
- [Netflix](https://www.netflix.com) for design inspiration

---
Created by [HsuanChi1204](https://github.com/HsuanChi1204)
