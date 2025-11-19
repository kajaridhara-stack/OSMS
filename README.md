Intellion – Online School Management System

Intellion is a simple web-based School Management System designed to help administrators manage students, timetables, fee structure, and library cards. The system includes secure login for both admins and students.

Features

Admin login and authentication

Student registration and login

View all students

Generate and manage library cards

Create and manage class timetables

Manage fee structure for each class

Technology Used

Frontend: HTML, CSS, JavaScript

Backend: Node.js, Express.js

Database: MongoDB (Atlas)

Project Structure
OSMS/
  backend/     → Node.js + Express API
  frontend/    → HTML/CSS/JS interface
  .gitignore
  README.md

## How to Run Locally

1. **Navigate to backend folder**

2. **Install dependencies**
```bash
npm install
```

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Set your MongoDB connection string in `MONGO_URL`
   - Set a secure JWT secret in `JWT_SECRET`
   - (Optional) Configure email settings if you want to send credentials to students

4. **Start server**
```bash
node server.js
```

5. **Open the frontend** `index.html` in a browser to use the system.

## Environment Variables

Create a `.env` file in the `backend` folder with:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
# Optional - Email configuration (system works without this)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=5000
```

**Note:** Email configuration is optional. The system will work without it, but students won't receive their credentials via email.
