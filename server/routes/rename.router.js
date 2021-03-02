import express from "express";
import config from "../config";
import checkToken from "../middlewares/checkToken";
import UserModel from "../models/User.model";
import Jwt from 'jsonwebtoken'

const route = () => {
  const router = new express.Router();

  router.route("/").put(checkToken, (req, res) => {
      const {apiKey} = req.token;
      const {fullName} = req.body;
    if(!apiKey || !fullName) return res.send({status:false, message: "apiKey and fullName required."})
    UserModel.updateOne({apiKey},{fullName})
    .then(data => {
        if(!data.nModified > 0) res.send({status:false, message:"There is no changes."})
        res.send({status:true, token:  Jwt.sign({apiKey:req.token.apiKey, email:req.token.email, fullName}, config.jwtSecret)})
    })
    .catch(e => res.send({status: false, message: "Server error."}))
  });

  return router;
};

export default {
  route,
  routerPrefix: `${config.version}/rename`,
};
