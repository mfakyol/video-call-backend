import mongoose from "mongoose";

import { nanoid } from "nanoid";

const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    userId: {
      index: true,
      unique: true,
      type: String,
    },
    id: {
      index: true,
      unique: true,
      type: String,
      default: () => nanoid(8),
    },
    name: {
      type: String,
    },
    password: {
      type: String,
    },
    roomSize: {
      type: Number,
      default: 4,
    },
    isJoinable: {
      type: Boolean,
      default: true,
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

export default mongoose.model("Room", roomSchema);
