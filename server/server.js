
import cookieParser from 'cookie-parser';
import cors from 'cors';
import "dotenv/config";
import express from 'express';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';

const app = express();
const port = process.env.PORT || 4000;
connectDB();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}));

//routes
// API endpoint
app.get('/', (req, res) => {
     res.send('Hello World');
})
// middleware   /api/auth
app.use('/api/auth', authRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});