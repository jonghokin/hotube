import express from "express";
import bqparam from "../../common/bqparam";
import RecommendController from "../../controller/RecommendController";

const router = express.Router();

/** 
 * @swagger
 * paths:
 *  /recommend/{contentUuid}:
 *    post:
 *      tags:
 *      - 좋아요 및 싫어요 관리
 *      summary: "좋아요, 싫어요 등록 / 변경 / 취소"
 *      description: ""
 *      parameters:
 *        - in: path
 *          name: contentUuid
 *          required: true
 *          description: 컨텐츠 UUID
 *          schema:
 *            type: string
 *      requestBody:
 *        required: false
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                  description: 종류(like, hate)
 *                cancel:
 *                  type: boolean
 *                  description: 취소 true
 *      responses:
 *        "200":
 *          description: 결과값
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              example: {
 *                  "result": {
 *                      "code": 200,
 *                      "message": "OK"
 *                  },
 *                  "context": {
 *                      "user": {
 *                          "uid": "admin",
 *                          "name": "어드민"
 *                      },
 *                      "isLogin": true
 *                  },
 *                  "body": "like를 하였습니다."
 *              }
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
 */
router.post('/:contentUuid', bqparam, RecommendController.recommendRegist);

export default router;