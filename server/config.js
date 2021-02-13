import mongoose from "mongoose";

const dbConnectionString = "connString";

export default {
  version: "/api/v1",
  jwtSecret: process.env.JWT_SECRET || "jwt-secret", 
  passwordSecret: process.env.PASSWORD_SECRET || "password-secret"
};

export function connectDb() {
  mongoose
    .connect(dbConnectionString, {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => console.log("Connected db"))
    .catch((err) => console.log(err.message));
}
