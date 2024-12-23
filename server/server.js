
import cookieParser from 'cookie-parser';
import cors from 'cors';
import "dotenv/config";
import express from 'express';
import connectDB from './config/mongodb.js';

const app = express();
const port = process.env.PORT || 8000;
connectDB();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}));

//routes
app.get('/', (req, res) => {
     res.send('Hello World');
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});