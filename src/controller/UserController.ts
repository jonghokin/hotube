import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { IVerifyOptions } from 'passport-local';
import { categoryType } from '../../common/attachment/IAttachment';
import { AttachmentHelper } from '../common/AttachmentHelper';
import { multipart } from '../common/Common';
import InternalError from '../common/InternalError';
import CODE from '../common/code';
import response from '../common/response';
import Attachment from '../models/attachment/Attachment';
import Channel from '../models/channel/Channel';
import User, { UserAttr } from '../models/user/User';
import VerificationCode from '..//models/verfication/VerficationCode';

export default class UserController {

    // 회원가입
    static signUp = async (req: Request, res: Response) => {

        const params: UserAttr = req.body;

        try {
            await User.sequelize?.transaction(async t => {

                // 아이디 중복 확인
                const existingUser = await User.findByPk(params.uid, { transaction: t });

                if (existingUser) {
                    throw new InternalError(CODE.Conflict, '사용할 수 없는 아이디입니다.');
                }

                if (params.password !== params.checkPassword) {
                    throw new InternalError(CODE.BadRequest, '비밀번호가 일치하지 않습니다.');
                }

                if (!params.password) {
                    throw new InternalError(CODE.BadRequest, '비밀번호를 입력해주세요');
                }

                // 비밀번호 암호화
                const hashedPassword = await bcrypt.hash(params.password, 12);

                const user = new User({
                    ...params,
                    email: `${params.uid}@naver.com`,
                    password: hashedPassword
                });

                await user.save({ transaction: t });

                // 채널 생성
                const myChannel = new Channel();
                myChannel.uid = user.uid;
                myChannel.name = `${user.name}의 채널`;
                await myChannel.save({ transaction: t });

                const responseData = {
                    uid: user.uid,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    birthday: user.birthday,
                    createdAt: user.createdAt
                }

                return response(req, res, CODE.OK, responseData);

            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // 프로필 수정
    static profileUpdate = async (req: Request, res: Response) => {

        const uid = res.locals.payload.uid;

        try {
            await User.sequelize?.transaction(async t => {

                const { files } = await multipart(req);

                const user = await User.findByPk(uid, { transaction: t });

                if (!user) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 사용자입니다.');
                }

                let thumbnail: any;

                if (files && files.length > 0) {
                    const attachment = await AttachmentHelper(req, user.uid, null, categoryType.USER, files, t);
                    user.thumbnailId = attachment[0].uuid;

                    thumbnail = await Attachment.findByPk(user.thumbnailId, { transaction: t });

                    if (!thumbnail) {
                        throw new InternalError(CODE.NotFound, '존재하지 않은 이미지입니다.');
                    }

                    thumbnail.enable = true;
                    await thumbnail.save({ transaction: t });
                }

                await user.save({ transaction: t });

                const responseData = {
                    uid: user.uid,
                    thumbnail: user.thumbnailId ? {
                        uuid: thumbnail.uuid,
                        path: thumbnail.path,
                        name: thumbnail.name,
                        origin: thumbnail.origin
                    } : undefined
                }

                return response(req, res, CODE.OK, responseData);

            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // 비밀번호 재설정(로그인 상태)
    static passwordUpdate = async (req: Request, res: Response) => {

        const params: UserAttr = req.body;
        const uid = res.locals.payload.uid;

        try {
            await User.sequelize?.transaction(async t => {

                const user = await User.findByPk(uid, { transaction: t });

                if (!user) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 사용자입니다.');
                }

                const password: any = params.password;

                if (password !== params.checkPassword) {
                    throw new InternalError(CODE.BadRequest, '비밀번호가 일치하지 않습니다.');
                }

                // 비밀번호 암호화
                const hashedPassword = await bcrypt.hash(password, 12);

                user.set('password', hashedPassword);

                await user.save({ transaction: t });

                return response(req, res, CODE.OK, '비밀번호가 변경되었습니다.');

            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // 비밀번호 재설정 (로그인 안한 상태)
    static pwdUpdateHome = async (req: Request, res: Response) => {
        const params: UserAttr = req.body;

        try {
            await User.sequelize?.transaction(async (t) => {
                const authCode: any = await VerificationCode.findOne({
                    where: { code: req.body.authCode },
                });

                if (!authCode) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 인증코드 입니다.');
                };

                const user: any = await User.findOne({
                    attributes: ['uid', 'name', 'updatedAt'],
                    where: { uid: params.uid },
                    transaction: t,
                });

                if (!user) {
                    throw new InternalError(CODE.NoContent, '조회된 사용자가 없습니다.');
                };

                if (params.password !== params.checkPassword) {
                    throw new InternalError(CODE.UnprocessableEntity, '비밀번호가 일치하지 않습니다.');
                };

                if (!params.password) {
                    throw new InternalError(CODE.BadRequest, '비밀번호를 입력해주세요')
                };

                const hashedPassword = await bcrypt.hash(params.password, 12);

                user.set('password', hashedPassword);
                user.set('checkPassword', params.checkPassword);

                await VerificationCode.destroy({
                    where: { code: authCode.code },
                    transaction: t,
                });

                await user.save({ transaction: t });

                return {
                    uid: user.uid,
                    name: user.name
                };
            });

            response(req, res, CODE.OK, '비밀번호를 재설정하였습니다.');
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // 내 정보 수정
    static userInfoUpdate = async (req: Request, res: Response) => {

        const params: UserAttr = req.body;
        const uid = res.locals.payload.uid;

        try {
            await User.sequelize?.transaction(async t => {

                const user = await User.findByPk(uid, { transaction: t });

                if (!user) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 사용자입니다.');
                }

                user.set('name', params.name);
                user.set('phone', params.phone);
                user.set('birthday', params.birthday);

                await user.save({ transaction: t });

                const responseData = {
                    uid: user.uid,
                    name: user.name,
                    phone: user.phone,
                    birthday: user.birthday
                }

                return response(req, res, CODE.OK, responseData);

            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // 회원탈퇴
    static withdraw = async (req: Request, res: Response) => {

        const uid = res.locals.payload.uid;

        try {
            await User.sequelize?.transaction(async t => {
                const user = await User.findByPk(uid, { transaction: t });

                if (!user) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 사용자입니다.');
                }

                await user.destroy({ transaction: t });

                return response(req, res, CODE.OK, '회원탈퇴가 완료되었습니다.');
            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // 로그인
    static async login(req: Request, uid: string, password: string, done: (error: any, user?: Express.User | false, options?: IVerifyOptions) => void) {
        try {

            const user: any = await User.findOne({
                attributes: ['uid', 'name', 'password', 'thumbnailId'],
                include: [
                    {
                        model: Attachment,
                        attributes: ['uuid', 'path'],
                        required: false
                    }
                ]
            });

            if (!user) {
                return done(new InternalError(CODE.BadRequest, '아이디 또는 비밀번호를 확인해주세요.'));
            }

            if (user.password === null) {
                return done(new InternalError(CODE.Auth.PasswordReset, '비밀번호를 재설정 해주세요.'));
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);

            if (!isPasswordMatch) {
                return done(new InternalError(CODE.BadRequest, '비밀번호를 확인해주세요.'));
            }

            const userData: any = {
                uid: user.uid,
                name: user.name,
                thumbnail: user.thumbnailId ? {
                    uuid: user.thumbnail.uuid,
                    path: user.thumbnail.path,
                } : undefined
            }

            return done(null, userData);

        } catch (error) {
            return done(new InternalError(CODE.InternalServerError));
        }
    }
}
