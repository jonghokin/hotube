import { NextFunction, Request, Response } from "express";

/**
 * 접근 권한 처리
 * Request 요청에 대한 토큰 또는 인증정보가 있는지 체크
 * @param req 
 * @param res 
 * @param next 
 */
export default function authorization(req: Request, res: Response, next: NextFunction) {

    console.log('## authorization ##');
    // console.log('## authorization.headers: ', req.headers);
    console.log('## authorization.cookies: ', req.cookies);
    next();
};