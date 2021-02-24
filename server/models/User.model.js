import mongoose from "mongoose";
import {nanoid} from 'nanoid'

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    id: {
      index: true,
      unique: true,
      type: String,
      default: nanoid,
    },
    apiKey: {
      index: true,
      unique: true,
      type: String,
      default: nanoid,
    },
    email: {
      index: true,
      unique: true,
      type: String,
      required: [true, "Email required."],
    },
    fullName: {
      type: String,
    },
    password: {
      type: String,
    },
    status: {
      type: String,
      default: "N",
    },
    activationCode: {
      type: String,
      default: Math.floor(100000 + Math.random() * 900000).toString(),
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

export default mongoose.model("User", userSchema);
