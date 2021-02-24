import express from "express";
import config from "../config";
import RoomModel from "../models/Room.model";
import checkToken from "../middlewares/checkToken";
import UserModel from "../models/User.model";

const route = () => {
  const router = new express.Router();

  router.route("/").get(checkToken, async (req, res) => {
    const { apiKey } = req.token;
    const { id } = req.query;

    const user = await UserModel.findOne({ apiKey }, { _id: 0 })
      .then((data) => data)
      .catch((e) => res.send({ status: false, message: "Server error." }));
    if (!user) return res.send({ status: false, message: "Invalid user." });
    RoomModel.findOne({ userId: user.id, id })
      .then((room) => {
        if (!room) return res.send({ status: false, message: "Invalid room." });
        return res.send({ status: true, room });
      })
      .catch((e) => res.send({ status: false, message: "Server error." }));
  });

  router.route("/").post(checkToken, async (req, res) => {
    const { apiKey } = req.token;
    const { name, password, roomSize } = req.body;
    const user = await UserModel.findOne({ apiKey })
      .then((data) => data)
      .catch((e) => res.send({ status: false, message: "Server error." }));
    if (!user) return res.send({ status: false, message: "Invalid user." });
    if (!name || !password || !roomSize)
      return res.send({
        status: false,
        message: "name, password, roomSize required",
      });

    let room = new RoomModel({ ...req.body, userId: user.id });
    room
      .save()
      .then((room) => {
        return res.send({ status: true, room: { id: room.id } });
      })
      .catch((e) => res.send({ status: false, message: "Server error." }));
  });

  router.route("/").put(checkToken, async (req, res) => {
    const { apiKey } = req.token;
    const user = await UserModel.findOne({ apiKey })
      .then((data) => data)
      .catch((e) => res.send({ status: false, message: "Server error." }));
    if (!user) return res.send({ status: false, message: "Invalid user." });
    RoomModel.findOneAndUpdate({ id: req.body.id }, { ...req.body })
      .then((data) => {
        if (!data) {
          return res.send({ status: false, message: "Invalid room." });
        }
        return res.send({ status: true, message: "Settings saved." });
      })
      .catch((e) => res.send({ status: false, message: e.toString() }));
  });

  router.route("/getrooms").get(checkToken, async (req, res) => {
    const { apiKey } = req.token;
    const user = await UserModel.findOne({ apiKey })
      .then((data) => data)
      .catch((e) => res.send({ status: false, message: "Server error." }));
    if (!user) return res.send({ status: false, message: "Invalid user." });
    RoomModel.find({ userId: user.id }, { _id: 0 })
      .then((rooms) => {
        res.send({ status: true, rooms });
      })
      .catch((e) => res.send({ status: false, message: "Server error." }));
  });

  return router;
};

export default {
  route,
  routerPrefix: `${config.version}/room`,
};
