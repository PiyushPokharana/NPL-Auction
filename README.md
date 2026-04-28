# NPL Auction System

Real-time auction platform for the IIIT Nagpur Premier League (NPL). The project is split into a Node.js + Express backend, a React frontend, MongoDB for persistence, and Socket.IO for live auction updates.

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas or a local MongoDB instance
- Two terminal windows for running backend and frontend together

## Project Structure

- `backend/` - Express API, MongoDB models, controllers, routes, and Socket.IO handlers
- `frontend/` - React UI for the auctioneer and team managers
- `checklist.md` - implementation tracker for the full assignment

## Setup

1. Install backend dependencies:

	```bash
	cd backend
	npm install
	```

2. Configure backend environment variables:

	```bash
	Copy-Item .env.example .env
	```

	Update `backend/.env` with your MongoDB connection string and port:

	```env
	MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/npl?retryWrites=true&w=majority
	PORT=5000
	NODE_ENV=development
	```

3. Install frontend dependencies:

	```bash
	cd ..\frontend
	npm install
	```

## Run the Application

1. Start the backend server:

	```bash
	cd backend
	npm start
	```

	The backend starts on the port defined in `backend/.env`.

2. Start the frontend app in a second terminal:

	```bash
	cd frontend
	npm start
	```

	The React app opens at ``.

## Available Scripts

### Backend

- `npm start` - start the API server
- `npm run dev` - start the API server with nodemon
- `npm run seed` - seed sample data
- `npm run verify-seed` - verify seeded data

### Frontend

- `npm start` - run the React development server
- `npm run build` - create a production build
- `npm test` - run the test suite

## Notes

- Make sure the backend is running before opening the frontend so Socket.IO can connect successfully.
- If you use MongoDB Atlas, add your current IP address to the allowed list.
- The implementation checklist and progress are tracked in [checklist.md](checklist.md).

## Verification

After both apps start successfully, confirm that:

- the backend responds without errors
- the frontend loads in the browser
- the auction UI can connect to the backend and receive live updates
