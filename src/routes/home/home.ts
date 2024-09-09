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
 *                              "name": "1"
 *                            },
 *                            "isLogin": true
 *                          },
 *                          "body": [
 *                            {
 *                              "uuid": "1d8a8d0f-65fa-4581-848d-2dac81136322",
 *                              "title": "1",
 *                              "viewCount": 1,
 *                              "createdAt": "2024-09-07T17:51:44.000Z",
 *                              "category": "game",
 *                              "creator": {
 *                                "uid": "test"
 *                              }
 *                            }
 *                          ]
 *                       }
 */
router.get('/', bqparam, HomeController.home);

export default router;