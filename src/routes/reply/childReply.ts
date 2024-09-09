import express from "express";
import ReplyController from "../../controller/ReplyController";
import bqparam from "../../common/bqparam";

const router = express.Router();

/**
 * @swagger
 * paths:
 *  /reply/{uuid}/childReply:
 *    get:
 *      tags:
 *      - 댓글 관리
 *      summary: "하위댓글 리스트"
 *      description: ""
 *      parameters:
 *        - in: path
 *          name: uuid
 *          required: true
 *          description: 부모댓글 UUID
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
 *                            "isLogin": false
 *                          },
 *                          "body": [
 *                            {
 *                              "uuid": "b5506498-9f37-4ab6-b7c2-b4dbfb9306f9",
 *                              "description": "자식댓글",
 *                              "createdAt": "2024-09-08T14:45:47.000Z",
 *                              "isMyReply": true,
 *                              "creator": {
 *                                "uid": "test",
 *                                "name": "1",
 *                                "thumbnail": {}
 *                              }
 *                            }
 *                          ]
 *                        }
 */
router.get('/', bqparam, ReplyController.childReplyDetail)

export default router;