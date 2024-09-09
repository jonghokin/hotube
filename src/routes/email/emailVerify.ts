import express from "express";
import bqparam from "../../common/bqparam";
import EmailAuthController from "../../controller/EmailAuthController";
import emailVerify from './emailVerify';

const router = express.Router();

/**
 * @swagger
 * paths:
 *  /email/verify:
 *    post:
 *      tags:
 *      - 이메일 인증
 *      summary: "인증번호 검증"
 *      description: ""
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: string
 *                  description: 인증코드
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
 *                              "uid": "admin",
 *                              "name": "어드민"
 *                            },
 *                            "isLogin": true
 *                          },
 *                          "body":"인증되었습니다."
 *                              
 *                       }
 *        "400":
 *          description: 인증코번호가 유효하지 않습니다., 인증번호가 만료되었습니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              example: {
 *                          "result":{
 *                              "code":404,
 *                              "message":"인증코번호가 유효하지 않습니다., 인증번호가 만료되었습니다."
 *                          }
 *                       }
 */
router.post('/', bqparam, EmailAuthController.authCode);

export default router;