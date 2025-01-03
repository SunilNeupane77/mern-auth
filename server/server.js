import cookieParser from 'cookie-parser';
import cors from 'cors';
import "dotenv/config";
import express from 'express';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 5000;
connectDB();

const allowedOrigins=["http://localhost:5173"]

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:allowedOrigins,credentials:true}));

//routes
// API endpoint
app.get('/', (req, res) => {
     res.send('Hello World');
})
// middleware   /api/auth
// middleware   /api/user
app.use('/api/auth', authRouter);
app.use("/api/user", userRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});