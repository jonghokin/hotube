import { Request, Response } from 'express';
import htmlParser, { HTMLElement } from 'node-html-parser';
import { categoryType } from '../../common/attachment/IAttachment';
import { recommendType } from '../../common/recommend/IRecommend';
import { AttachmentHelper } from '../common/AttachmentHelper';
import { multipart } from '../common/Common';
import InternalError from '../common/InternalError';
import CODE from '../common/code';
import response from '../common/response';
import Attachment from '../models/attachment/Attachment';
import Category from '../models/category/Category';
import Channel from '../models/channel/Channel';
import Complaint from '../models/complaint/Complaint';
import Content, { ContentAttr } from '../models/content/Content';
import Recommend from '../models/recommend/Recommend';
import Reply from '../models/reply/Reply';
import Subscribe from '../models/subscribe/Subscribe';
import User from '../models/user/User';
import Watch from '../models/watch/Watch';

export default class ContentController {

    // 동영상 등록
    static contentRegist = async (req: Request, res: Response) => {

        try {
            await Content.sequelize?.transaction(async t => {

                const uid = res.locals.payload.uid;

                const { fields, files } = await multipart(req);

                const user: any = await User.findByPk(uid, {
                    include: [
                        {
                            model: Channel,
                        }
                    ],
                    transaction: t
                });

                if (!user || !uid) {
                    throw new InternalError(CODE.NotFound, '유저 정보가 없습니다.');
                }

                if (!files) {
                    throw new InternalError(CODE.UnprocessableEntity, '동영상을 업로드 해주세요.');
                }

                const content = new Content(fields as ContentAttr);

                if (fields.tag) {
                    const root = htmlParser(fields.tag);
                    const excludedTags = ['figure', '&nbsp;'];

                    content.description = root.childNodes
                        .filter(node => {
                            if (node.nodeType !== 1) return true;
                            const element = node as HTMLElement;
                            return !excludedTags.includes(element.tagName.toLowerCase());
                        })
                        .map(node => node.rawText.replace(/&nbsp;/g, '').trim())
                        .join(' ')
                        .trim();

                } else {
                    content.description = '';
                }

                content.channelUuid = user.channel?.uuid;
                content.creatorId = user.uid;

                let category;

                if (fields.category) {

                    category = await Category.findOne({
                        where: { name: fields.category },
                        transaction: t
                    });

                    if (!category) {
                        throw new InternalError(CODE.NotFound, '존재하지 않은 카테고리입니다.');
                    }

                    content.categoryUuid = category.uuid;
                }

                await content.save({ transaction: t });

                let thumbnail: any;

                if (files && files.length > 0) {
                    const attachment = await AttachmentHelper(req, user.uid, content.uuid, categoryType.CONTENT, files, t);
                    content.thumbnailId = attachment[0].uuid;
                    await content.save({ transaction: t });

                    thumbnail = await Attachment.findByPk(user.thumbnailId, { transaction: t });

                    if (!thumbnail) {
                        throw new InternalError(CODE.NotFound, '존재하지 않은 파일입니다.');
                    }

                    thumbnail.enable = true;
                    await thumbnail.save({ transaction: t });
                }

                const responseData = {
                    uuid: content.uuid,
                    title: content.title,
                    category: category?.name,
                    channel: user.channel?.name,
                    tag: content.tag,
                    description: content.description,
                    thumbnail: {
                        uuid: thumbnail.uuid,
                        path: thumbnail.path,
                    },
                    creator: {
                        uid: user?.uid,
                        name: user?.name,
                    },
                    createdAt: content.createdAt
                }

                return response(req, res, CODE.OK, responseData);

            });
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // // 수정
    // static contentUpdate = async (req: Request, res: Response) => {
    //     try {
    //         await Content.sequelize?.transaction(async t => {
    //             const uid = res.locals.payload.uid;
    //             const { fields, files } = await multipart(req);
    //             const params = fields as ContentAttr

    //             const content = await Content.findByPk(params.uuid, { transaction: t });

    //             if (!content) {
    //                 throw new InternalError(CODE.NotFound, '존재하지 않은 영상입니다.');
    //             }

    //             if (content.creatorId !== uid) {
    //                 throw new InternalError(CODE.Auth.Unauthorized, '삭제 권한이 없습니다.');
    //             }

    //             let thumbnail: any;

    //             if (files && files.length > 0) {
    //                 const attachment = await AttachmentHelper(req, uid, content.uuid, categoryType.CONTENT, files, t);
    //                 content.thumbnailId = attachment[0].uuid;

    //                 thumbnail = await Attachment.findByPk(user.thumbnailId, { transaction: t });

    //                 if (!thumbnail) {
    //                     throw new InternalError(CODE.NotFound, '존재하지 않은 파일입니다.');
    //                 }

    //                 thumbnail.enable = true;
    //                 await thumbnail.save({ transaction: t });
    //             }


    //         });
    //     } catch (error) {
    //         response(req, res, CODE.InternalServerError, error);
    //     }
    // }

    // 영상시청 (상세보기)
    static contentDetail = async (req: Request, res: Response) => {

        try {

            await Content.sequelize?.transaction(async t => {

                const params: ContentAttr = req.body;
                const uid = res.locals.payload.uid;

                const content: any = await Content.findByPk(params.uuid, {
                    attributes: ['uuid', 'tag', 'viewCount'],
                    include: [
                        {
                            model: Reply,
                            as: 'replies',
                            required: false
                        },
                        {
                            model: Recommend,
                            as: 'recommends',
                            required: false
                        },
                        {
                            model: User,
                            as: 'creator',
                            attributes: ['uid'],
                            include: [
                                {
                                    model: Channel,
                                    as: 'channel',
                                    attributes: ['name'],
                                    include: [
                                        {
                                            model: Subscribe,
                                            as: 'subscribes',
                                            required: false
                                        }
                                    ]
                                },
                                {
                                    model: Attachment,
                                    as: 'thumbnail',
                                    attributes: ['uuid', 'path'],
                                    required: false
                                }
                            ]
                        }
                    ],
                    transaction: t
                });

                if (!content) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 동영상입니다.');
                }

                // 구독여부
                const subscribeStatus = await Subscribe.findByPk(uid, { transaction: t });

                // 좋아요 또는 싫어요 여부
                const recommendStatus = await Recommend.findByPk(uid, { transaction: t });

                // 신고여부
                const complaintStatus = await Complaint.findByPk(uid, { transaction: t });

                // 시청여부
                const watchStatus = await Watch.findByPk(uid, { transaction: t });

                // 시청기록등록
                if (!watchStatus) {
                    const watch = new Watch();
                    watch.contentUuid = content.uuid;
                    watch.uid = uid;
                    await watch.save({ transaction: t });
                }

                //조회수 증가
                content.viewCount += 1;
                await content.save({ transaction: t });

                const responseData = {
                    uuid: content.uuid,
                    title: content.title,
                    tag: content.tag,
                    creator: {
                        uid: content.creator?.uid,
                        thumbnail: content.creator?.thumbnailId ? {
                            uuid: content.creator?.thumbnail?.uuid,
                            path: content.creator?.thumbnail?.path,
                        } : undefined,
                        channeName: content.creator?.channel?.name,
                    },
                    subscribeCount: content.creator.channel.subscribes.length,
                    viewCount: content.viewCount,
                    replyCount: content.replies?.length,
                    recommendCount: content.recommends?.length,
                    recommendType: {
                        likeCount: content.recommends?.filter((r: any) => r.type === recommendType.LIKE).length,
                        hateCount: content.recommends?.filter((r: any) => r.type === recommendType.HATE).length,
                    },
                    isComplaint: complaintStatus ? true : false,
                    isSubscribe: subscribeStatus ? true : false,
                    isRecommend: recommendStatus ? true : false,
                }

                return response(req, res, CODE.OK, responseData);
            });
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // 동영상 삭제
    static contentDelete = async (req: Request, res: Response) => {

        try {
            await Content.sequelize?.transaction(async t => {
                const uid = res.locals.payload.uid;
                const params: ContentAttr = req.body;

                const content = await Content.findByPk(params.uuid, {
                    include: [
                        {
                            model: Watch,
                            as: 'watchs',
                            required: false
                        }
                    ],
                    transaction: t
                });

                if (!content) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 영상입니다.');
                }

                // 권한처리
                if (content.creatorId !== uid) {
                    throw new InternalError(CODE.Auth.Unauthorized, '삭제 권한이 없습니다.');
                }

                // 삭제되는 영상의 시청기록을 모두 삭제
                if (content.watchs) {
                    const watch = await Watch.findByPk(content.uuid, { transaction: t })
                    await watch?.destroy({ transaction: t });
                }

                await content.destroy({ transaction: t });

                return response(req, res, CODE.OK, '영상 삭제를 완료하였습니다.');
            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }
}
