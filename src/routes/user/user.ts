import express from "express";
import bqparam from "../../common/bqparam";
import UserController from "../../controller/UserController";
import userPwd from './userPwd';

const router = express.Router();

router.use('/:uid/password', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    req.query.uid = req.params.uid,
        next();
}, userPwd);

/**
 * @swagger
 * paths:
 *  /user:
 *    post:
 *      tags:
 *      - 사용자 관리
 *      summary: "사용자 등록"
 *      description: ""
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                uid:
 *                  type: string
 *                  description: 사용자 ID
 *                birthday:
 *                  type: string
 *                  description: 생년월일 (2000-01-01)
 *                name:
 *                  type: string
 *                  description: 사용자명
 *                phone:
 *                  type: string
 *                  description: 전화번호
 *                password:
 *                  type: string
 *                  description: 비밀번호
 *                checkPassword:
 *                  type: string
 *                  description: 비밀번호 확인
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
 *                            "uid": "test",
 *                            "name": "1",
 *                            "email": "test@naver.com",
 *                            "phone": "1",
 *                            "birthday": "1",
 *                            "createdAt": "2024-09-05T13:59:28.152Z"
 *                          }
 *                        }
 */
router.post('/', bqparam, UserController.signUp)

/**
 * @swagger
 * paths:
 *  /user/profileUpdate:
 *    put:
 *      tags:
 *      - 사용자 관리
 *      summary: "프로필 사진 변경"
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
 *                            "user": {
 *                              "uid": "test",
 *                              "name": "1"
 *                            },
 *                            "isLogin": true
 *                          },
 *                          "body": {
 *                            "uid": "test",
 *                            "thumbnail": {
 *                              "uuid": "ac2683ad-215e-4f2b-a810-8c357feb93c1",
 *                              "path": "/hotube_upload/240905/1725547087537.jpg",
 *                              "name": "1725547087537.jpg",
 *                              "origin": "다운로드.jpg"
 *                            }
 *                          }
 *                        }
 */
router.put('/profileUpdate', bqparam, UserController.profileUpdate)

/**
 * @swagger
 * paths:
 *  /user/passwordUpdate:
 *    put:
 *      tags:
 *      - 사용자 관리
 *      summary: "비밀번호 변경(로그인 상태)"
 *      description: ""
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                password:
 *                  type: string
 *                  description: 비밀번호
 *                checkPassword:
 *                  type: string
 *                  description: 비밀번호 확인
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
 *                            "user": {
 *                              "uid": "test",
 *                              "name": "1"
 *                            },
 *                            "isLogin": true
 *                          },
 *                          "body": {
 *                            "uid": "test",
 *                            "thumbnail": {
 *                              "uuid": "ac2683ad-215e-4f2b-a810-8c357feb93c1",
 *                              "path": "/hotube_upload/240905/1725547087537.jpg",
 *                              "name": "1725547087537.jpg",
 *                              "origin": "다운로드.jpg"
 *                            }
 *                          }
 *                        }
 */
router.put('/passwordUpdate', bqparam, UserController.passwordUpdate)

/**
 * @swagger
 * paths:
 *  /user/userInfoUpdate:
 *    put:
 *      tags:
 *      - 사용자 관리
 *      summary: "사용자 정보 변경"
 *      description: ""
 *      requestBody:
 *        required: true
 *        content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  description: 이름
 *                phone:
 *                  type: string
 *                  description: 전화번호
 *                birthday:
 *                  type: string
 *                  description: 생년월일
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
 *                            "user": {
 *                              "uid": "test",
 *                              "name": "1"
 *                            },
 *                            "isLogin": true
 *                          },
 *                          "body": {
 *                            "uid": "test",
 *                            "thumbnail": {
 *                              "uuid": "ac2683ad-215e-4f2b-a810-8c357feb93c1",
 *                              "path": "/hotube_upload/240905/1725547087537.jpg",
 *                              "name": "1725547087537.jpg",
 *                              "origin": "다운로드.jpg"
 *                            }
 *                          }
 *                        }
 */
router.put('/userInfoUpdate', bqparam, UserController.userInfoUpdate)

/**
 * @swagger
 * paths:
 *  /user/withdraw:
 *    delete:
 *      tags:
 *      - 사용자 관리
 *      summary: "회원탈퇴"
 *      description: ""
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
 *                            "user": {
 *                              "uid": "test",
 *                              "name": "1"
 *                            },
 *                            "isLogin": true
 *                          },
 *                          "body": {
 *                            "uid": "test",
 *                            "thumbnail": {
 *                              "uuid": "ac2683ad-215e-4f2b-a810-8c357feb93c1",
 *                              "path": "/hotube_upload/240905/1725547087537.jpg",
 *                              "name": "1725547087537.jpg",
 *                              "origin": "다운로드.jpg"
 *                            }
 *                          }
 *                        }
 */
router.delete('/withdraw', bqparam, UserController.withdraw)

export default router;