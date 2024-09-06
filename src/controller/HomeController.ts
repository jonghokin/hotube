import { Request, Response } from 'express';
import ModelHelper from '../common/ModelHelper';
import { findOptions } from '../common/bqparam';
import CODE from '../common/code';
import response from '../common/response';
import Attachment from '../models/attachment/Attachment';
import Category from '../models/category/Category';
import Channel from '../models/channel/Channel';
import Content from '../models/content/Content';
import User from '../models/user/User';

export default class HomeController {

    // 메인화면
    static home = async (req: Request, res: Response) => {

        try {
            await Content.sequelize?.transaction(async t => {

                //카테고리 검색
                const category = req.query.category;

                const options = findOptions(req, {
                    attributes: ['uuid', 'title', 'viewCount', 'createdAt', 'categoryUuid'],
                    include: [
                        {
                            model: Category,
                            as: 'category',
                            attributes: ['uuid', 'name'],
                            where: category ? { name: category } : undefined
                        },
                        {
                            model: Attachment,
                            as: 'thumbnail',
                            attributes: ['uuid', 'path'],
                            required: false
                        },
                        {
                            model: Channel,
                            as: 'channel',
                            attributes: ['uuid', 'name'],
                            include: [
                                {
                                    model: User,
                                    as: 'user',
                                    attributes: ['uid'],
                                    include: [
                                        {
                                            model: Attachment,
                                            as: 'thumbnail',
                                            attributes: ['uuid', 'path'],
                                            required: false,
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    order: [['viewCount', 'DESC']]
                });

                const contents = await ModelHelper.findRetrieveCountAll(Content, req, options);

                if (contents.rows.length === 0) {
                    return response(req, res, CODE.NoContent, '영상이 존재하지 않습니다.');
                }

                const responseData = contents.rows.map(content => {
                    return {
                        uuid: content.uuid,
                        title: content.title,
                        viewCount: content.viewCount,
                        createdAt: content.createdAt,
                        category: content.category.name,
                        thumbnail: content.thumbnailId ? {
                            uuid: content.thumbnail.uuid,
                            path: content.thumbnail.path,
                        } : undefined,
                        creator: {
                            uid: content.channel.user.uid,
                            thumbnail: content.channel.user.thumbnailId ? {
                                uuid: content.channel.user.thumbnail.uuid,
                                path: content.channel.user.thumbnail.path,
                            } : undefined
                        }
                    }
                });

                return response(req, res, CODE.OK, { rows: responseData, count: contents.count });
            });
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }
}
