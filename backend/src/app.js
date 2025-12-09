import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import spotsRoutes from "./routes/spots.routes.js";
import userRoutes from "./routes/user.routes.js";
import errorHandler from "./utils/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/spots", spotsRoutes);
app.use("/api/blogs", blogRoutes);

app.use(errorHandler);

export default app;
