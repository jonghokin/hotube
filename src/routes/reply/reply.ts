import express from "express";
import ReplyController from "../../controller/ReplyController";
import bqparam from "../../common/bqparam";

const router = express.Router();

/**
 * @swagger
 * paths:
 *  /reply/content:
 *    post:
 *      tags:
 *      - 댓글 관리
 *      summary: "댓글 등록"
 *      description: ""
 *      parameters:
 *        - in: query
 *          name: uuid
 *          required: true
 *          description: 컨텐츠 UUID
 *          schema:
 *            type: string
 *        - in: query
 *          name: parentUuid
 *          required: false
 *          description: 부모 댓글의 uuid (대댓글 등록시)
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                description:
 *                  type: string
 *                  description: 댓글 내용
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
 *                          "body": {
 *                            "complaintCount": 0,
 *                            "description": "부모댓글",
 *                            "uuid": "b9fdb018-3167-4275-8269-33bdd4d29c99",
 *                            "contentUuid": "1d8a8d0f-65fa-4581-848d-2dac81136322",
 *                            "creatorId": "test",
 *                            "updatedAt": "2024-09-08T14:44:24.499Z",
 *                            "createdAt": "2024-09-08T14:44:24.499Z"
 *                          }
 *                        }
 */
router.post('/content', bqparam, ReplyController.replyRegist)

/**
 * @swagger
 * paths:
 *  /reply/{uuid}:
 *    put:
 *      tags:
 *      - 댓글 관리
 *      summary: "댓글 수정"
 *      description: ""
 *      parameters:
 *        - in: path
 *          name: uuid
 *          required: true
 *          description: 댓글 UUID
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                description:
 *                  type: string
 *                  description: 댓글 내용
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
 *                          "body": {
 *                            "uuid": "b9fdb018-3167-4275-8269-33bdd4d29c99",
 *                            "contentUuid": "1d8a8d0f-65fa-4581-848d-2dac81136322",
 *                            "parentUuid": null,
 *                            "complaintCount": 0,
 *                            "description": "부모댓글 수정",
 *                            "creatorId": "test",
 *                            "createdAt": "2024-09-08T14:44:24.000Z",
 *                            "updatedAt": "2024-09-08T14:45:57.567Z"
 *                          }
 *                        }
 */
router.put('/:uuid', bqparam, ReplyController.replyUpdate)

/**
 * @swagger
 * paths:
 *  /reply/{uuid}:
 *    delete:
 *      tags:
 *      - 댓글 관리
 *      summary: "댓글 삭제"
 *      description: ""
 *      parameters:
 *        - in: path
 *          name: uuid
 *          required: true
 *          description: 댓글 UUID
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
 *                          "body": "댓글이 삭제되었습니다."
 *                        }
 */
router.delete('/:uuid', bqparam, ReplyController.replyDelete)


export default router;