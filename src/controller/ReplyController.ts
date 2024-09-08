import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import InternalError from '../common/InternalError';
import CODE from '../common/code';
import response from '../common/response';
import Content from '../models/content/Content';
import Reply, { ReplyAttr } from '../models/reply/Reply';

export default class ReplyController {

    // 댓글 등록
    static replyRegist = async (req: Request, res: Response) => {

        try {

            await Reply.sequelize?.transaction(async (t: any) => {

                const uid = res.locals.payload.uid;
                const params: ReplyAttr = req.body;
                const uuid = req.query.uuid as string;
                const parentUuid = req.query.parentUuid as string;

                const content = await Content.findByPk(uuid, { transaction: t });

                if (!content) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 영상입니다.');
                }

                const newReply = new Reply({
                    ...params,
                    uuid: uuidv4(),
                    contentUuid: content.uuid,
                    creatorId: uid
                });

                // 대댓글 등록시
                if (params.parentUuid && uuid) {
                    const parentReply = await Reply.findOne({
                        where: { uuid: parentUuid },
                        transaction: t
                    });

                    if (!parentReply) {
                        throw new InternalError(CODE.NotFound, '존재하지 않은 댓글입니다.');
                    }

                    newReply.parentUuid = parentReply.uuid;
                    newReply.contentUuid = content.uuid;
                    newReply.creatorId = uid;
                }

                await newReply.save({ transaction: t });

                return response(req, res, CODE.OK, newReply);
            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // 댓글 수정
    static replyUpdate = async (req: Request, res: Response) => {

        try {

            await Reply.sequelize?.transaction(async (t: any) => {

                const uid = res.locals.payload.uid;
                const params: ReplyAttr = req.body;

                const reply = await Reply.findByPk(params.uuid, { transaction: t });

                if (!reply) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 댓글입니다.');
                }

                if (reply.creatorId !== uid) {
                    throw new InternalError(CODE.Auth.Unauthorized, '수정 권한이 없습니다.');
                }

                reply.set('description', params.description);

                await reply.save({ transaction: t });

                return response(req, res, CODE.OK, reply);
            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // 댓글 삭제
    static replyDelete = async (req: Request, res: Response) => {

        try {

            await Reply.sequelize?.transaction(async (t: any) => {

                const uid = res.locals.payload.uid;
                const params: ReplyAttr = req.body;

                const reply = await Reply.findByPk(params.uuid, { transaction: t });

                if (!reply) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 댓글입니다.');
                }

                if (reply.creatorId !== uid) {
                    throw new InternalError(CODE.Auth.Unauthorized, '삭제 권한이 없습니다.');
                }

                await reply.destroy({ transaction: t });

                return response(req, res, CODE.OK, '댓글이 삭제되었습니다.');
            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }
}
