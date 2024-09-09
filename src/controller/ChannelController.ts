import { Request, Response } from 'express';
import InternalError from '../common/InternalError';
import CODE from '../common/code';
import response from '../common/response';
import Attachment from '../models/attachment/Attachment';
import Channel, { ChannelAttr } from '../models/channel/Channel';
import Content from '../models/content/Content';
import Subscribe from '../models/subscribe/Subscribe';
import User from '../models/user/User';

export default class ChannelController {

    // 나의 채널 상세보기
    static myChannelDetail = async (req: Request, res: Response) => {

        try {
            await Channel.sequelize?.transaction(async t => {

                const uid = res.locals.payload.uid;
                const params: ChannelAttr = req.body;

                const myChannel = await Channel.findOne({
                    attributes: ['uuid', 'name'],
                    include: [
                        {
                            model: Content,
                            as: 'contents',
                            attributes: ['uuid', 'title'],
                            include: [
                                {
                                    model: Attachment,
                                    as: 'thumbnail',
                                    attributes: ['uuid', 'path']
                                }
                            ],
                            required: false,
                        },
                        {
                            model: Subscribe,
                            as: 'subscribes',
                            required: false
                        },
                        {
                            model: User,
                            as: 'user',
                            attributes: ['uid', 'name'],
                            include: [
                                {
                                    model: Attachment,
                                    as: 'thumbnail',
                                    attributes: ['uuid', 'path'],
                                    required: false
                                }
                            ]
                        }
                    ],
                    where: { ownerId: uid },
                    transaction: t
                });

                const responseData = {
                    uuid: myChannel?.uuid,
                    channelName: myChannel?.name,
                    subscribes: myChannel?.subscribes?.length,
                    owner: {
                        uid: myChannel?.user?.uid,
                        name: myChannel?.user?.name,
                        thumbnail: {
                            uuid: myChannel?.user?.thumbnail?.uuid,
                            path: myChannel?.user?.thumbnail?.path,
                        }
                    },
                    contents: myChannel?.contents?.map(content => {
                        return {
                            uuid: content.uuid,
                            title: content.title,
                            thumbnail: {
                                uuid: content.thumbnail?.uuid,
                                path: content.thumbnail?.path,
                            }
                        }
                    })
                }

                return response(req, res, CODE.OK, responseData);

            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // 채널 구독 및 취소
    static channelSubscribe = async (req: Request, res: Response) => {

        try {
            await Channel.sequelize?.transaction(async t => {
                const uid = res.locals.payload.uid;
                const params: ChannelAttr = req.body;
                const isCancelBoolean = typeof params.cancel === 'string' ? params.cancel === 'true' : !!params.cancel;

                const channel = await Channel.findOne({
                    where: { uuid: params.uuid },
                    transaction: t
                });

                if (!channel) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 채널입니다.');
                }

                if (channel.ownerId === uid) {
                    throw new InternalError(CODE.BadRequest, '자신의 채널을 구독할 수 없습니다.');
                }

                const existingSubs = await Subscribe.findOne({
                    where: { channelUuid: params.uuid, uid: uid },
                    transaction: t
                });

                if (isCancelBoolean) {
                    if (existingSubs) {
                        await existingSubs.destroy({ transaction: t });
                        return response(req, res, CODE.OK, '구독을 취소하였습니다.');
                    }
                    return response(req, res, CODE.BadRequest, '구독 내역이 없습니다.');
                }

                if (existingSubs) {
                    return response(req, res, CODE.Conflict, '이미 구독한 채널입니다.');
                }

                const subscribe = new Subscribe();
                subscribe.channelUuid = channel.uuid;
                subscribe.uid = uid;
                await subscribe.save({ transaction: t });

                return response(req, res, CODE.OK, `${channel.name} 채널을 구독하였습니다.`);

            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }
}
