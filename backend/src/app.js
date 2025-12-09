import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import authRoutes from "./features/auth/auth.routes.js";
import blogRoutes from "./features/blogs/blog.routes.js";
import spotsRoutes from "./features/spots/spots.routes.js";
import userRoutes from "./features/users/user.routes.js";
import swaggerDoc from "./docs/swagger.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import requestLogger from "./middleware/requestLogger.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(apiLimiter);

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/docs/swagger.json", (req, res) => res.json(swaggerDoc));
app.get("/docs", (req, res) => res.json({ message: "Swagger spec available at /docs/swagger.json" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/spots", spotsRoutes);
app.use("/api/blogs", blogRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
