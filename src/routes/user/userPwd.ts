import express from 'express';
import bqparam from '../../common/bqparam';
import UserController from '../../controller/UserController';


const router = express.Router();

/**
 * @swagger
 * paths:
 *  /user/{uid}/password/verify:
 *    put:
 *      tags:
 *      - 사용자 관리
 *      summary: "비밀번호 변경(로그인 안한 상태)"
 *      description: ""
 *      parameters:
 *        - in: path
 *          name: uid
 *          required: false
 *          description: 사용자 ID (uid)
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                authCode:
 *                  type: string
 *                  description: 인증번호
 *                password:
 *                  type: string
 *                  description: 비밀번호
 *                checkPassword:
 *                  type: string
 *                  description: 비밀번호 확인
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
 *                                  "uid": "admin@i2l.co.kr",
 *                                  "name": "어드민",
 *                                  "level": "admin",
 *                                  "createdAt": "2024-04-23T23:45:19.000Z"
 *                              },
 *                              "isLogin": true
 *                          },
 *                            "body": {
 *                              "uid": "group1",
 *                              "name": "이강인",
 *                              "updatedAt": "2024-05-28T05:56:22.931Z",
 *                              "password": "0000"
 *                            }
 *                        }
 *        "400":
 *          description: |
 *             비밀번호가 일치하지 않을 때</br>
 *             비밀번호를 입력하지 않았을 때</br>
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              examples:
 *                authCode:
 *                  summary: 비밀번호가 일치하지 않을 때
 *                  value: {
 *                    "result": {
 *                      "code": 400,
 *                      "message": "비밀번호가 일치하지 않습니다."
 *                    }
 *                  }
 *                user:
 *                  summary: 비밀번호를 입력하지 않았을 때
 *                  value: {
 *                    "result": {
 *                      "code": 400,
 *                      "message": "비밀번호를 입력해주세요"
 *                    }
 *                  }
 *        "422":
 *          description: 비밀번호가 일치하지 않을 때
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              example: {
 *                          "result":{
 *                              "code":422,
 *                              "message":"비밀번호가 일치하지 않습니다."
 *                          }
 *                       }
 *        "404":
 *          description: |
 *             존재하지 않은 인증코드 일 때</br>
 *             조회된 사용자가 없을 때</br>
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *              examples:
 *                authCode:
 *                  summary: 존재하지 않은 인증코드 일 때
 *                  value: {
 *                    "result": {
 *                      "code": 404,
 *                      "message": "존재하지 않은 인증코드 입니다."
 *                    }
 *                  }
 *                user:
 *                  summary: 조회된 사용자가 없을 때
 *                  value: {
 *                    "result": {
 *                      "code": 404,
 *                      "message": "조회된 사용자가 없습니다."
 *                    }
 *                  }
 */
router.put('/verify', bqparam, UserController.pwdUpdateHome);


export default router;