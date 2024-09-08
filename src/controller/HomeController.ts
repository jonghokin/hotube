import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import ModelHelper from '../common/ModelHelper';
import { findOptions } from '../common/bqparam';
import CODE from '../common/code';
import response from '../common/response';
import Attachment from '../models/attachment/Attachment';
import Category from '../models/category/Category';
import Channel from '../models/channel/Channel';
import Content from '../models/content/Content';
import User from '../models/user/User';
import Watch from '../models/watch/Watch';

export default class HomeController {

    // 메인화면
    static home = async (req: Request, res: Response) => {

        try {
            await Content.sequelize?.transaction(async t => {

                const uid = res.locals.payload.uid;

                // 사용자가 시청한 동영상 및 카테고리 추출
                const watched = await Watch.findAll({
                    attributes: ['contentUuid'],
                    include: [
                        {
                            model: Content,
                            as: 'content',
                            attributes: ['uuid', 'categoryUuid'],
                            include: [
                                {
                                    model: Category,
                                    as: 'category',
                                    attributes: ['uuid', 'name']
                                }
                            ]
                        }
                    ],
                    where: { uid: uid },
                    transaction: t
                });

                // 시청한 카테고리별로 카운트 계산
                const categoryCounts: Record<string, number> = {};
                const watchedContentUuids = watched.map(w => w.contentUuid);

                watched.forEach(w => {
                    const categoryName = w.content?.category?.name;
                    if (categoryName) {
                        if (categoryCounts[categoryName]) {
                            categoryCounts[categoryName]++;
                        } else {
                            categoryCounts[categoryName] = 1;
                        }
                    }
                });

                // 가장 많이 시청한 카테고리 조회
                const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
                const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : null;

                // 카테고리, 제목 검색
                const category = req.query.category;
                const title = req.query.title;

                const options = findOptions(req, {
                    attributes: [
                        'uuid', 'title', 'viewCount', 'createdAt', 'categoryUuid',
                        // 시청한 동영상을 목록 뒤로 배치
                        [Sequelize.literal(`CASE 
                            WHEN \`category\`.\`name\` = '${topCategory}' AND ${watchedContentUuids.length > 0
                                ? `\`Content\`.\`uuid\` NOT IN (${watchedContentUuids.map(uuid => `'${uuid}'`).join(', ')})`
                                : '1 = 1'  // 비어있는 경우 항상 참이 되는 조건
                            } THEN 1 
                            WHEN \`category\`.\`name\` = '${topCategory}' AND ${watchedContentUuids.length > 0
                                ? `\`Content\`.\`uuid\` IN (${watchedContentUuids.map(uuid => `'${uuid}'`).join(', ')})`
                                : '1 = 0'  // 비어있는 경우 항상 거짓이 되는 조건
                            } THEN 2 
                            ELSE 3 END`), 'priority']
                    ],
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
                    where: title ? { title: { [Op.like]: `%${title}%` } } : undefined,
                    // 우선순위에 따라 정렬 후 조회수 순으로 정렬
                    order: [[Sequelize.literal('priority'), 'ASC'], ['viewCount', 'DESC']]
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
                    };
                });

                return response(req, res, CODE.OK, { rows: responseData, count: contents.count });
            });
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }
}
