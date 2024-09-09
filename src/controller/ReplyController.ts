import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import InternalError from '../common/InternalError';
import CODE from '../common/code';
import response from '../common/response';
import Attachment from '../models/attachment/Attachment';
import Content, { ContentAttr } from '../models/content/Content';
import Reply, { ReplyAttr } from '../models/reply/Reply';
import User from '../models/user/User';

export default class ReplyController {

    // 부모댓글 리스트
    static parentReplyList = async (req: Request, res: Response) => {

        try {
            await Content.sequelize?.transaction(async t => {
                const uid = res.locals.payload.uid;
                const params: ContentAttr = req.body;

                const content = await Content.findOne({
                    include: [
                        {
                            model: User,
                            as: 'creator',
                            attributes: ['uid']
                        },
                        {
                            model: Reply,
                            as: 'replies',
                            attributes: ['uuid', 'description', 'pinned', 'createdAt'],
                            include: [
                                {
                                    model: User,
                                    as: 'creator',
                                    attributes: ['uid', 'name'],
                                    required: false,
                                    include: [
                                        {
                                            model: Attachment,
                                            as: 'thumbnail',
                                            attributes: ['uuid', 'path'],
                                            required: false
                                        }
                                    ]
                                },
                                {
                                    model: Reply,
                                    as: 'childReplies',
                                    required: false
                                }
                            ],
                            where: { parentUuid: null },
                            order: [['pinned', 'DESC'], ['createdAt', 'ASC']],
                        }
                    ],
                    where: { uuid: params.uuid },
                    transaction: t
                });

                if (!content) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 영상입니다.');
                }

                const responseData = content.replies?.map(reply => {
                    return {
                        uuid: reply.uuid,
                        description: reply.description,
                        pinned: reply.pinned,
                        createdAt: reply.createdAt,
                        childReplies: reply.childReplies?.length, // 하위댓글 카운트
                        isMyContent: content.creator?.uid === uid ? true : false, //내가 게시한 동영상인지 체크
                        isMyReply: reply.creator?.uid === uid ? true : false,     //내가 작성한 댓글인지 체크
                        creator: {
                            uid: reply.creator?.uid,
                            name: reply.creator?.name,
                            thumbnail: {
                                uuid: reply.creator?.thumbnail?.uuid,
                                path: reply.creator?.thumbnail?.path,
                            }
                        }
                    }
                });

                return response(req, res, CODE.OK, responseData);
            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // 하위댓글 리스트
    static childReplyDetail = async (req: Request, res: Response) => {

        try {

            await Reply.sequelize?.transaction(async (t: any) => {

                const uid = res.locals.payload.uid;
                const params: ReplyAttr = req.body;

                const parentReply = await Reply.findOne({
                    include: [
                        {
                            model: User,
                            as: 'creator',
                            attributes: ['uid'],
                        },
                        {
                            model: Reply,
                            as: 'childReplies',
                            attributes: ['uuid', 'description', 'createdAt'],
                            required: false,
                            include: [
                                {

                                    model: User,
                                    as: 'creator',
                                    attributes: ['uid', 'name'],
                                    required: false,
                                    include: [
                                        {
                                            model: Attachment,
                                            as: 'thumbnail',
                                            attributes: ['uuid', 'path'],
                                            required: false
                                        }
                                    ]
                                }
                            ]
                        },
                    ],
                    where: { uuid: params.uuid },
                    transaction: t
                });

                if (!parentReply) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 댓글입니다.');
                }

                const responseData = parentReply.childReplies?.map(childReply => {
                    return {
                        uuid: childReply.uuid,
                        description: childReply.description,
                        createdAt: childReply.createdAt,
                        isMyReply: childReply.creator?.uid === uid ? true : false,     //내가 작성한 댓글인지 체크
                        creator: {
                            uid: childReply.creator?.uid,
                            name: childReply.creator?.name,
                            thumbnail: {
                                uuid: childReply.creator?.thumbnail?.uuid,
                                path: childReply.creator?.thumbnail?.path,
                            }
                        }
                    }
                });

                return response(req, res, CODE.OK, responseData);

            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

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
