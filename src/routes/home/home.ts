import express from "express";
import bqparam from "../../common/bqparam";
import HomeController from "../../controller/HomeController";

const router = express.Router();

/**
 * @swagger
 * paths:
 *  /home:
 *    get:
 *      tags:
 *      - 메인
 *      summary: "메인화면"
 *      description: ""
 *      parameters:
 *        - in: query
 *          name: category
 *          required: false
 *          description: "카테고리 검색"
 *          schema:
 *            type: string
 *        - in: query
 *          name: page
 *          required: false
 *          description: "페이지"
 *          schema:
 *            type: string
 *        - in: query
 *          name: pageSize
 *          required: false
 *          description: "데이터수"
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
 *                              "name": "1",
 *                              "createdAt": "2024-04-23T23:45:19.000Z"
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
router.get('/', bqparam, HomeController.home);

export default router;