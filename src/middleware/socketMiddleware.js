import jwt from 'jsonwebtoken';
export default function socketMiddleware (socket, next) {
 
  const refreshToken = socket.handshake.auth.refresh_token;
  if (!refreshToken) {
    return next(new Error("invalid username"));
  }
  socket.refreshToken = refreshToken;
  next();
}