import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import InternalError from '../common/InternalError';
import CODE from '../common/code';
import response from '../common/response';
import User, { UserAttr } from '../models/user/User';
import VerificationCode, { VerificationCodeAttr } from '../models/verfication/VerficationCode';

// 네이버 SMTP 설정
export const naverTransport = nodemailer.createTransport({
    host: 'smtp.naver.com',
    port: 587,
    secure: false,
    auth: {
        user: 'testemail2024@naver.com',
        pass: 'MSQMRD39CZKV'
    },
    tls: {
        rejectUnauthorized: false
    }
});

export default class EmailAuthController {

    // 인증번호 이메일 전송
    static authEmail = async (req: Request, res: Response) => {
        const params: UserAttr = req.body;
        const code = await EmailAuthController.randomCode(12);

        try {
            const user: any = await User.findByPk(params.uid);

            if (!user) {
                throw new InternalError(CODE.BadRequest, '이메일을 다시 확인해주세요');
            }

            const hotube = 'HOTUBE';

            const mailOptions = {
                from: '"HOTUBE" <testemail2024@naver.com>',  // 변경된 발신자 정보
                to: `${params.uid}@naver.com`,
                subject: `[ ${hotube} ] 요청하신 인증번호를 알려드립니다.`,
                html: '<h3>아래의 인증번호를 인증번호 입력창에 입력해 주세요</h3>' +
                    `<h3>인증번호 : <strong style="color: navy;">${code}</strong></h3>` +
                    `<h3>${hotube}를 이용해 주셔서 감사합니다.</h3>`
            };

            const existingCode = await VerificationCode.findOne({
                where: { uid: params.uid }
            });

            if (existingCode) {
                await VerificationCode.destroy({
                    where: { uid: params.uid },
                });
            };

            naverTransport.sendMail(mailOptions, async (err, result) => {
                if (err) {
                    response(req, res, err, '메일 전송 실패');
                    return;
                } else {
                    try {
                        const verificCode = new VerificationCode(req.body);

                        verificCode.set('uid', params.uid);
                        verificCode.set('expireAt', new Date(new Date().getTime() + 3 * 60000));
                        verificCode.set('code', code);
                        await verificCode.save();
                        response(req, res, CODE.OK, code);
                    } catch (err) {
                        response(req, res, CODE.InternalServerError, err);
                    };
                };
            });
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        };
    };

    // 인증번호 번호 검증
    static authCode = async (req: Request, res: Response) => {
        const params: VerificationCodeAttr = req.body;

        try {
            await VerificationCode.sequelize?.transaction(async t => {
                const verificCode: any = await VerificationCode.findOne({
                    where: { code: params.code },
                    transaction: t
                });

                if (!verificCode) {
                    return response(req, res, new InternalError(CODE.BadRequest, '인증번호를 다시 확인해주세요'));
                };

                const now = new Date();
                const expireAt = new Date(verificCode.get('expireAt'));

                if (now > expireAt) {
                    return response(req, res, new InternalError(CODE.Auth.Expired, '인증번호가 만료되었습니다'));
                };

                return response(req, res, CODE.OK, '인증이 완료되었습니다.');
            })
        } catch (error) {
            return response(req, res, CODE.InternalServerError, error);
        };
    };

    // 인증코드 생성
    private static randomCode = async (length: number): Promise<string> => {
        const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(i + 65));
        const numbers = Array.from({ length: 10 }, (_, i) => String.fromCharCode(i + 48));
        const chars = alphabet.concat(numbers);
        let result = '';
        const charsLength = chars.length;

        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * charsLength)];
        };

        return result;
    };
};
