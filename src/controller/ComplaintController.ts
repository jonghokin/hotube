import { Request, Response } from 'express';
import { complaintCategory } from '../../common/complaint/IComplaint';
import { statusType } from '../../common/content/IContent';
import InternalError from '../common/InternalError';
import CODE from '../common/code';
import response from '../common/response';
import Complaint from '../models/complaint/Complaint';
import Content, { ContentAttr } from '../models/content/Content';
import Reply, { ReplyAttr } from '../models/reply/Reply';

export default class ComplaintController {

    // 컨텐츠 신고
    static contentCompalint = async (req: Request, res: Response) => {

        try {

            await Content.sequelize?.transaction(async (t: any) => {

                const params: ContentAttr = req.body;
                const uid = res.locals.payload?.uid;
                const complaintBoolean = typeof params.complaint === 'string' ? params.complaint === 'true' : !!params.complaint;

                const content: any = await Content.findByPk(params.uuid, { transaction: t });

                if (!content) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 컨텐츠입니다.');
                }

                const excitingComplaint = await Complaint.findOne({
                    where: { refererUuid: content.uuid, uid: uid }
                })

                if (!complaintBoolean) {
                    if (excitingComplaint) {
                        await excitingComplaint?.destroy({ transaction: t });
                        return response(req, res, CODE.OK, '해당 영상의 신고를 취소하였습니다.')
                    }
                    content.complaintCount = Math.max(0, content.complaintCount - 1); //신고 취소
                    return response(req, res, CODE.OK, '신고내역이 존재하지 않습니다.')

                } else {
                    content.complaintCount += 1; // 신고횟수 증가   
                    if (content.complaintCount >= 20) {  // 20회 이상 신고 됐을시 블라인드 처리
                        content.status = statusType.BLIND;
                    }
                    if (excitingComplaint) {
                        return response(req, res, CODE.BadRequest, '이미 신고한 영상입니다.')
                    }

                    const contentReport = new Complaint();
                    contentReport.refererUuid = content.uuid;
                    contentReport.uid = uid;
                    contentReport.complaintCategory = complaintCategory.CONTENT;
                    await contentReport.save({ transaction: t })
                };

                await content.save({ transaction: t });

                return response(req, res, CODE.OK, '해당 영상을 신고하였습니다.')
            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }

    // 댓글 신고
    static replyCompalint = async (req: Request, res: Response) => {

        try {

            await Reply.sequelize?.transaction(async (t: any) => {

                const params: ReplyAttr = req.body;
                const uid = res.locals.payload?.uid;
                const complaintBoolean = typeof params.complaint === 'string' ? params.complaint === 'true' : !!params.complaint;

                const reply: any = await Reply.findByPk(params.uuid, { transaction: t });

                if (!reply) {
                    throw new InternalError(CODE.NotFound, '존재하지 않은 컨텐츠입니다.');
                }

                const excitingComplaint = await Complaint.findOne({
                    where: { refererUuid: reply.uuid, uid: uid }
                })

                if (!complaintBoolean) {
                    if (excitingComplaint) {
                        await excitingComplaint?.destroy({ transaction: t });
                        return response(req, res, CODE.OK, '해당 댓글의 신고를 취소하였습니다.')
                    }
                    reply.complaintCount = Math.max(0, reply.complaintCount - 1); //신고 취소
                    return response(req, res, CODE.OK, '신고내역이 존재하지 않습니다.')

                } else {
                    reply.complaintCount += 1; // 신고횟수 증가   
                    if (reply.complaintCount >= 20) {  // 20회 이상 신고 됐을시 블라인드 처리
                        reply.status = statusType.BLIND;
                    }
                    if (excitingComplaint) {
                        return response(req, res, CODE.BadRequest, '이미 신고한 댓글입니다.')
                    }

                    const contentReport = new Complaint();
                    contentReport.refererUuid = reply.uuid;
                    contentReport.uid = uid;
                    contentReport.complaintCategory = complaintCategory.REPLY;
                    await contentReport.save({ transaction: t })
                };

                await reply.save({ transaction: t });

                return response(req, res, CODE.OK, '해당 댓글을 신고하였습니다.')
            })
        } catch (error) {
            response(req, res, CODE.InternalServerError, error);
        }
    }
}
