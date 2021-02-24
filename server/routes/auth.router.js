import express from "express";
import config from "../config";
import UserModel from "../models/User.model";
import Jwt from "jsonwebtoken";

const route = () => {
  const router = new express.Router();

  router.route("/").get((req, res) => {
    const { email, password } = req.query;
    if (!email || !password)
      return res.send({
        status: false,
        message: "email and password required.",
      });
    UserModel.findOne(
      { email, password, status: "A" },
      { email: 1, fullName: 1, apiKey: 1, _id: 0 }
    )
      .then((userData) => {
        if (!userData)
          return res.send({
            status: false,
            message: "Invalid email or password.",
          });
        return res.send({
          status: true,
          token: Jwt.sign({...userData._doc}, config.jwtSecret),
        });
      })
      .catch((e) => res.send({ status: false, message: "Server error." }));
  });

  router.route("/").post((req, res) => {
    const { email, fullName, password } = req.body;
    if (!email || !fullName || !password)
      return res.send({ status: false, message: "Please fill all fields." });
    UserModel.findOne({ email })
      .then((data) => {
        if (data)
          return res.send({
            status: false,
            message: "This email already registered.",
          });
        const user = new UserModel({ email, password, fullName });
        user.save().then((data) => {
          return res.send({
            status: true,
            message: `We sent activation mail to ${data.email} address. (${data.activationCode})`,
          });
        });
      })
      .catch((e) => res.send({ status: false, message: "Server error." }));
  });

  router.route("/").put((req, res) => {
    const { email, activationCode } = req.body;
    if ((!email, !activationCode))
      return res.send({
        status: false,
        message: "email and activationCode required.",
      });

    UserModel.updateOne(
      { email, activationCode },
      { activationCode: null, status: "A" }
    )
      .then((data) => {
        if (!data.nModified)
          return res.send({
            status: false,
            message: "Invalid email or activation code.",
          });
        return res.send({ status: true, message: "Your account activated." });
      })
      .catch((e) => res.send({ status: false, message: "Server error." }));
  });

  return router;
};

export default {
  route,
  routerPrefix: `${config.version}/auth`,
};
