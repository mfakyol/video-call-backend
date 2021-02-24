import mongoose from "mongoose";

const dbConnectionString = "mongodb+srv://video_chat_admin:NFaizj1BUD5BpAL0@cluster0.hfsxe.mongodb.net/video_chat_db?retryWrites=true&w=majority";

export default {
  version: "/api/v1",
  jwtSecret: process.env.JWT_SECRET || "jwt-secret", 
  passwordSecret: process.env.PASSWORD_SECRET || "password-secret"
};

export function connectDb() {
  mongoose.set('useFindAndModify', false);
  mongoose
    .connect(dbConnectionString, {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => console.log("Connected db"))
    .catch((err) => console.log(err.message));
}
