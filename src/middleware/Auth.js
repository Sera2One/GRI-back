import jwt from 'jsonwebtoken';
export default function auth (req, res, next) {
 
  const accessToken = req.cookies.access_token;
  
  if (!accessToken) {

    return res
      .status(403)
      .send({ message: "Action non autorisée: jeton d'authentification absent" });
  }
  jwt.verify(accessToken, process.env.JWT_SECRET , (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).send({ message: "Token expiré" });
      }
      return res.status(500).send({ message: "Internal Server Error" });
    }

    req.userId = decoded._id;
    next();
  });
}