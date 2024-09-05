import express from "express";
import { QueryTypes } from "sequelize";
import Passport from "../../common/Passport";
import CODE from "../../common/code";
import response from "../../common/response";

const router = express.Router();

/**
 * @swagger
 * /token:
 *  post:
 *    security: 
 *      - bearerAuth: []
 *    summary: "로그인"
 *    description: ""
 *    tags: [로그인 및 로그아웃]
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            required:
 *              - uid
 *              - password
 *            properties:
 *              uid:
 *                type: string
 *                description: 사용자 ID(uid)
 *              password:
 *                type: string
 *                description: 패스워드
 *    responses:
 *      "200":
 *        description: 결과값
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              example: {
 *                          "result": {
 *                              "code": 200,
 *                              "message": "OK"
 *                          },
 *                          "context": {
 *                              "user":{
 *                                  "uid": "admin",
 *                                  "name": "아이투엘",
 *                                  "level": "admin"
 *                              },
 *                              "isLogin":true
 *                          }
 *                       }
 *        "210":
 *          description: pin 재설정이 필요합니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              example: {
 *                          "result":{
 *                              "code":210,
 *                              "message":"pin 재설정이 필요합니다."
 *                          }
 *                       }
 *        "211":
 *          description: 비밀번호 기간 만료되었습니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              example: {
 *                          "result":{
 *                              "code":211,
 *                              "message":"비밀번호 기간 만료되었습니다."
 *                          }
 *                       }
 *        "400":
 *          description: 비밀번호가 일치하지 않습니다.(공통)
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              example: {
 *                          "result":{
 *                              "code":400,
 *                              "message":"비밀번호가 일치하지 않습니다."
 *                          }
 *                       }
 *        "404":
 *          description: 회원정보가 존재하지 않습니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              example: {
 *                          "result":{
 *                              "code":400,
 *                              "message":"회원정보가 존재하지 않습니다."
 *                          }
 *                       }
 *        "410":
 *          description: 비밀번호 재설정이 필요합니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              example: {
 *                          "result":{
 *                              "code":410,
 *                              "message":"비밀번호 재설정이 필요합니다."
 *                          }
 *                       }
 */
router.post('/', Passport.signin, (req: express.Request, res: express.Response) => {

    console.log(`/token, res.locals.payload : `, JSON.stringify(res.locals));
    response(req, res, CODE.OK);
});

/**
 * @swagger
 * /token:
 *  delete:
 *    security: 
 *      - bearerAuth: []
 *    summary: "로그아웃"
 *    description: ""
 *    tags: [로그인 및 로그아웃]
 *    responses:
 *      "200":
 *        description: 결과값
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              example: {
 *                          "result": {
 *                              "code": 200,
 *                              "message": "OK"
 *                          },
 *                          "context": {
 *                              "user":{
 *                                  "uid": "admin",
 *                                  "name": "아이투엘",
 *                                  "level": "admin"
 *                              },
 *                              "isLogin":true
 *                          },
 *                          "body": {
 *                              "uid": "admin",
 *                              "name": "아이투엘",
 *                              "level": "admin"
 *                              }
 *                       }
 */
router.delete('/', Passport.signout, (req: express.Request, res: express.Response) => {

    console.log(`/token/logout, res.locals.payload : `, JSON.stringify(res.locals));
    response(req, res, CODE.OK, res.locals.payload ? res.locals.payload : undefined);
});

export default router;