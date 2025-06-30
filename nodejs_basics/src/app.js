import express from 'express';
import dotenv from "dotenv";
dotenv.config();

import connectDB from './db/index.js';
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

//----------------------------------------------------------------
// Middlewares
//----------------------------------------------------------------
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));

app.use(express.static("public"));
app.use(cookieParser());

// routes import ------------------------------------------------
import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users", userRouter);

app.get('/status', (req, res) => {
    const timestamp = new Date().toLocaleString(); // Local timestamp
    res.json({
        status: "ok",
        timestamp: timestamp
    });
})

//----------------------------------------------------------------
//------------------------ Main ----------------------------------
//----------------------------------------------------------------

/* Connect db and start */
connectDB().
then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`server running on port: http://localhost:${process.env.PORT}`);
    })
}).catch(err => {
    console.log("err db: ", err);
})






/*
import mongoose from "mongoose";

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`, {});

        app.on('error', (error) => {
            console.log('app db connection err: ', error);
        })

        app.listen(process.env.PORT, () => {
            console.log(`server running on port: ${process.env.PORT}`);
        })

    } catch (error) {
        console.log('err connecting db: ', error);
        throw error;
    }
})()
*/
