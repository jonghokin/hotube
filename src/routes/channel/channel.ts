import express from "express";
import bqparam from "../../common/bqparam";
import ChannelController from "../../controller/ChannelController";

const router = express.Router();

/** 
 * @swagger
 * paths:
 *  /channel/my:
 *    get:
 *      tags:
 *      - 채널 관리
 *      summary: "나의 채널 상세보기"
 *      description: ""
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
 *                  "body": {
 *                    "uuid": "155c282e-3dc6-4ee3-ad2f-72a87b7c54ff",
 *                    "channelName": "1의 채널",
 *                    "subscribes": 0,
 *                    "owner": {
 *                      "uid": "test",
 *                      "name": "1",
 *                      "thumbnail": {}
 *                    },
 *                    "contents": [
 *                      {
 *                        "uuid": "1d8a8d0f-65fa-4581-848d-2dac81136322",
 *                        "title": "1",
 *                        "thumbnail": {
 *                          "uuid": "93e11e48-c170-4996-a0f1-16b59a06ebb1",
 *                          "path": "/hotube_upload/240908/1725731504358.mp4"
 *                        }
 *                      }
 *                    ]
 *                  }
 *              }
 */
router.get('/my', bqparam, ChannelController.myChannelDetail);

/** 
 * @swagger
 * paths:
 *  /channel/{uuid}:
 *    post:
 *      tags:
 *      - 채널 관리
 *      summary: "채널 구독 및 취소"
 *      description: ""
 *      parameters:
 *        - in: path
 *          name: uuid
 *          required: true
 *          description: 채널 UUID
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                cancel:
 *                  type: boolean
 *                  description: true 취소
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
 *                  "body": {
 *                    "uuid": "155c282e-3dc6-4ee3-ad2f-72a87b7c54ff",
 *                    "channelName": "1의 채널",
 *                    "subscribes": 0,
 *                    "owner": {
 *                      "uid": "test",
 *                      "name": "1",
 *                      "thumbnail": {}
 *                    },
 *                    "contents": [
 *                      {
 *                        "uuid": "1d8a8d0f-65fa-4581-848d-2dac81136322",
 *                        "title": "1",
 *                        "thumbnail": {
 *                          "uuid": "93e11e48-c170-4996-a0f1-16b59a06ebb1",
 *                          "path": "/hotube_upload/240908/1725731504358.mp4"
 *                        }
 *                      }
 *                    ]
 *                  }
 *              }
 */
router.post('/:uuid', bqparam, ChannelController.channelSubscribe);

export default router;