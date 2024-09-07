import express from "express";
import bqparam from "../../common/bqparam";
import ContentController from "../../controller/ContentController";

const router = express.Router();

/**
 * @swagger
 * paths:
 *  /content:
 *    post:
 *      tags:
 *      - 동영상 관리
 *      summary: "동영상 등록"
 *      description: ""
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                file:
 *                  type: string
 *                  format: binary
 *                category:
 *                  type: string
 *                  description: 카테고리명(sprot, game, food)
 *                title:
 *                  type: string
 *                  description: 글 제목
 *                tag:
 *                  type: string
 *                  description: 글 내용
 *      responses:
 *        "200":
 *          description: 동영상 등록
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
 *                            "uuid": "64c09f89-fe41-4cf8-8e88-bb6b9ff99da9",
 *                            "title": "게임",
 *                            "category": "game",
 *                            "channel": "1의 채널",
 *                            "tag": "<h1>게임</h1>",
 *                            "description": "게임",
 *                            "thumbnail": {
 *                              "uuid": "d3de7c13-efe2-4c99-bdc9-11e5741f8d36",
 *                              "path": "/hotube_upload/240906/1725628793088.mp4"
 *                            },
 *                            "creator": {
 *                              "uid": "test",
 *                              "name": "1"
 *                            },
 *                            "createdAt": "2024-09-06T13:19:53.195Z"
 *                          }
 *                        }
 */
router.post('/', bqparam, ContentController.contentRegist)

/**
 * @swagger
 * paths:
 *  /content/{uuid}:
 *    get:
 *      tags:
 *      - 동영상 관리
 *      summary: "동영상 시청"
 *      description: ""
 *      parameters:
 *        - in: path
 *          name: uuid
 *          required: true
 *          description: 컨텐츠 UUID
 *          schema:
 *            type: string
 *      responses:
 *        "200":
 *          description: 사용자 등록
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
 *                            "uuid": "64c09f89-fe41-4cf8-8e88-bb6b9ff99da9",
 *                            "tag": "<h1>게임</h1>",
 *                            "creator": {
 *                              "uid": "test",
 *                              "channeName": "1의 채널"
 *                            },
 *                            "subscribeCount": 0,
 *                            "viewCount": 0,
 *                            "replyCount": 0,
 *                            "recommendCount": 0,
 *                            "recommendType": {
 *                              "likeCount": 0,
 *                              "hateCount": 0
 *                            },
 *                            "isComplaint": false,
 *                            "isSubscribe": false,
 *                            "isRecommend": false
 *                          }
 *                        }
 */
router.get('/:uuid', bqparam, ContentController.contentDetail)

export default router;