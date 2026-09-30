import { Request, Response, NextFunction } from 'express';
import { stringify } from 'querystring';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // TODO: Student implementation - Part 1: Authentication Middleware
  // Store the authenticated userId on res.locals.userId
  const userID = req.headers["x-user-id"];
  if (!userID){
    res.status(401).json({ error:   "Missing UserID"});
    return;
  }
  const checkedUserID = +userID;
  if (Number.isNaN(checkedUserID)){
    res.status(401).json(  { error : "bad request - invalid user id"});
    return;
  }

  res.locals.userID = userID;
  next();
}

export default authMiddleware;
