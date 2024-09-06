import { Request, Response } from 'express';
import htmlParser, { HTMLElement } from 'node-html-parser';
import { categoryType } from '../../common/attachment/IAttachment';
import { AttachmentHelper } from '../common/AttachmentHelper';
import { multipart } from '../common/Common';
import InternalError from '../common/InternalError';
import CODE from '../common/code';
import response from '../common/response';
import Attachment from '../models/attachment/Attachment';
import Category from '../models/category/Category';
import Channel from '../models/channel/Channel';
import Content, { ContentAttr } from '../models/content/Content';
import User from '../models/user/User';

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

                let thumbnail: any;

                if (files && files.length > 0) {
                    const attachment = await AttachmentHelper(req, user.uid, null, categoryType.CONTENT, files, t);
                    user.thumbnailId = attachment[0].uuid;

                    thumbnail = await Attachment.findByPk(user.thumbnailId, { transaction: t });

                    if (!thumbnail) {
                        throw new InternalError(CODE.NotFound, '존재하지 않은 파일입니다.');
                    }

                    thumbnail.enable = true;
                    await thumbnail.save({ transaction: t });
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

                content.thumbnailId = thumbnail.uuid;
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
}
