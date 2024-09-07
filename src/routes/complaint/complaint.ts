import express from "express";
import bqparam from "../../common/bqparam";
import ComplaintController from "../../controller/ComplaintController";

const router = express.Router();

// 컨텐츠 신고
/**
 * @swagger
 * paths:
 *  /complaint/content/{uuid}:
 *    post:
 *      tags:
 *      - 신고 관리
 *      summary: "영상 신고"
 *      description: ""
 *      parameters:
 *        - in: path
 *          name: uuid
 *          required: true
 *          description: 컨텐츠 UUID
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                complaint:
 *                  type: boolean
 *                  decription: 신고 (true)
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
 *                              "user": {
 *                                  "uid": "admin",
 *                                  "name": "관리자",
 *                                  "level": "admin"
 *                              },
 *                              "isLogin": true
 *                          },
 *                          "body":[
 *                              {
 *                                  "uuid":"12fadae9-1ea1-2d2e-b11a-11be11bac1f1",
 *                                  "complatintCount":"5"
 *                              }
 *                          ]
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
 */
router.post('/content/:uuid', bqparam, ComplaintController.contentCompalint);

// 댓글 신고
/**
 * @swagger
 * paths:
 *  /complaint/reply/{uuid}:
 *    post:
 *      tags:
 *      - 신고 관리
 *      summary: "댓글 신고"
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
 *                complaint:
 *                  type: boolean
 *                  decription: 신고 (true)
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
 *                              "user": {
 *                                  "uid": "admin",
 *                                  "name": "관리자",
 *                                  "level": "admin"
 *                              },
 *                              "isLogin": true
 *                          },
 *                          "body":[
 *                              {
 *                                  "uuid":"12fadae9-1ea1-2d2e-b11a-11be11bac1f1",
 *                                  "complatintCount":"5"
 *                              }
 *                          ]
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
 */
router.post('/reply/:uuid', bqparam, ComplaintController.replyCompalint);

export default router;