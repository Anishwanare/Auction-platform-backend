import { config } from "dotenv";
import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { databaseConnection } from "./database/db.js";
import { errorMiddleWare } from "./middleware/error.js";
import userRouter from "./router/userRouter.js"
import auctionItemRouter from "./router/auctionItemRouter.js"
import bidsRouter from "./router/bidsRouter.js"
import commisionRouter from "./router/commisionRouter.js"
import superadminRouter from "./router/superAdminRoutes.js"
import { endedAuctionCron } from "./automations/endedAuctionCron.js"
import { verifyCommissionCron } from "./automations/verifyCommissionCron.js"

const app = express();
config({
    path: "./config/config.env",
});

app.use(
    cors({
        origin: [process.env.FRONTEND_URL],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

//middlewares
app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp/",
}))


// Routes
app.use("/api/v1/user", userRouter)
app.use('/api/v2/auction', auctionItemRouter)
app.use('/api/v3/auction/bid', bidsRouter)
app.use('/api/v4/auction/commission', commisionRouter)
app.use('/api/v4/superadmin', superadminRouter)
endedAuctionCron

()
verifyCommissionCron()

databaseConnection();

app.use(errorMiddleWare)

export default app;
