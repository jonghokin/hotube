import express from "express";
import bqparam from "../../common/bqparam";
import EmailAuthController from "../../controller/EmailAuthController";
import emailVerify from './emailVerify';

const router = express.Router();

router.use('/verify', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    next();
}, emailVerify);

/**
 * @swagger
 * paths:
 *  /email/{uid}:
 *    post:
 *      tags:
 *      - 이메일 인증
 *      summary: "인증번호 전송"
 *      description: ""
 *      parameters:
 *        - in: path
 *          name: uid
 *          required: true
 *          description: 사용자 이메일
 *          schema:
 *            type: string
 *      responses:
 *        "200":
 *          description: 결과값
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              example: {
 *                          "result":{
 *                              "code":200,
 *                              "message":"OK"
 *                          },
 *                          "context": {
 *                            "user": {
 *                              "uid": "test",
 *                              "name": "1"
 *                            },
 *                            "isLogin": true
 *                          },
 *                          "body":
 *                              {
 *                                  "authCode": "084SRO"
 *                              }
 *                       }
 *        "404":
 *          description: 해당 리소스가 존재하지 않습니다
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              example: {
 *                          "result":{
 *                              "code":404,
 *                              "message":"해당 리소스가 존재하지 않습니다."
 *                          }
 *                       }
 *        "500":
 *          description: 인증 이메일 발송 실패
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              example: {
 *                          "result":{
 *                              "code":500,
 *                              "message":"InternalServerError"
 *                          }
 *                       }
 */
router.post('/:uid', bqparam, EmailAuthController.authEmail);

export default router;