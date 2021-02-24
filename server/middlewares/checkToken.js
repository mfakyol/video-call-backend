import jwt, { decode } from "jsonwebtoken";
import config from "../../server/config";

export default async function (req, res, next) {
  const token =
    (await decodeToken(req.headers.authorization)) ||
    (await jwt.verify(
      req.query.token,
      config.jwtSecret,
      (err, decoded) => decoded
    ));
  if (!token) {
    return res.send({ status: false, message: "Invalid token." });
  } else {
    req.token = token;
    next();
  }
}

const decodeToken = (data = "") =>
  jwt.verify(data.split(" ")[1], config.jwtSecret, (err, decoded) => decoded);
