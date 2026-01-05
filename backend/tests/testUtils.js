import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, "../../.env");
const backendEnvPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: backendEnvPath });

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "test";
}

export const startTestServer = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to run tests");
  }
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI, { connectTimeoutMS: 10000 });
  }
  const { default: app } = await import("../src/app.js");
  const server = app.listen(0);
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
};

export const stopTestServer = async (server) => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export const jsonRequest = async (baseUrl, route, options = {}) => {
  const { body, headers, ...rest } = options;
  const finalHeaders = { ...(headers || {}) };
  let payload;
  if (body !== undefined) {
    payload = typeof body === "string" ? body : JSON.stringify(body);
    if (!finalHeaders["Content-Type"]) {
      finalHeaders["Content-Type"] = "application/json";
    }
  }
  const res = await fetch(`${baseUrl}${route}`, {
    ...rest,
    headers: finalHeaders,
    body: payload,
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { res, status: res.status, body: data };
};

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const createTestUser = async (baseUrl, { role = "regular", namePrefix = "Test" } = {}) => {
  const tag = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const email = `${namePrefix.toLowerCase()}-${tag}@example.com`;
  const password = `Pwd-${Math.random().toString(36).slice(2)}!`;
  const name = `${namePrefix} ${tag}`;

  const registerRes = await jsonRequest(baseUrl, "/api/auth/register", {
    method: "POST",
    body: { name, email, password },
  });

  if (registerRes.status !== 201) {
    throw new Error(`Failed to register test user: ${registerRes.status}`);
  }

  if (role !== "regular") {
    await User.findOneAndUpdate({ email }, { role });
  }

  const loginRes = await jsonRequest(baseUrl, "/api/auth/login", {
    method: "POST",
    body: { email, password },
  });

  const token = loginRes.body?.data?.token;
  const id = loginRes.body?.data?.user?.id;

  if (!token || !id) {
    throw new Error("Failed to login test user");
  }

  return { id, email, password, name, token };
};
