import { Request, Response } from 'express';
import { recommendType } from '../../common/recommend/IRecommend';
import InternalError from '../common/InternalError';
import CODE from '../common/code';
import response from '../common/response';
import Channel from '../models/channel/Channel';
import Content from '../models/content/Content';
import Recommend, { RecommendAttr } from '../models/recommend/Recommend';
import User from '../models/user/User';

export default class RecommendController {

    // 좋아요 및 싫어요
    static recommendRegist = async (req: Request, res: Response) => {
        try {
            await Recommend.sequelize?.transaction(async t => {
                const uid = res.locals.payload.uid;
                const params: RecommendAttr = req.body;
                const cancelBoolean = typeof params.cancel === 'string' ? params.cancel === 'true' : !!params.cancel;

                const user = await User.findByPk(uid, {
                    include: [{ model: Channel }],
                    transaction: t,
                });

                if (!user || !uid) {
                    throw new InternalError(CODE.NotFound, '유저 정보가 없습니다.');
                }

                const content = await Content.findByPk(params.contentUuid, { transaction: t });

                if (!content) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 동영상입니다.');
                }

                // 기존 좋아요 및 싫어요 여부 확인
                const existingRecommend = await Recommend.findOne({
                    where: {
                        uid: uid,
                        contentUuid: params.contentUuid,
                    },
                    transaction: t,
                });

                // 기존 추천이 있을 경우
                if (existingRecommend) {
                    if (cancelBoolean) {
                        // 취소 요청 시 기존 레코드 삭제
                        await existingRecommend.destroy({ transaction: t });
                        return response(req, res, CODE.OK, '추천이 취소되었습니다.');
                    } else {
                        // 추천 타입을 업데이트
                        existingRecommend.type = params.type;
                        await existingRecommend.save({ transaction: t });
                        return response(req, res, CODE.OK, `${params.type}로 변경 하였습니다.`);
                    }
                } else {
                    // 새로운 추천 생성
                    const newRecommend = new Recommend({
                        contentUuid: params.contentUuid,
                        uid: uid,
                        type: params.type,
                    });
                    await newRecommend.save({ transaction: t });
                    return response(req, res, CODE.OK, `${params.type}를 하였습니다.`);
                }
            });
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    };

}
