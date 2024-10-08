import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { categoryType } from '../../common/attachment/IAttachment';
import InternalError from '../common/InternalError';
import CODE from '../common/code';
import Attachment from '../models/attachment/Attachment';
import Content from '../models/content/Content';
import User from '../models/user/User';
import { FileInfo } from './Common';

async function getRefererUuid(refererUuid: string): Promise<{ uuid: string, category: categoryType | undefined }> {
    const models: any = [
        { model: User, key: 'uid', category: 'user' },
        { model: Content, key: 'uuid', category: 'content' },
    ];

    for (const { model, key, category } of models) {
        const result = await model.findOne({ where: { [key]: refererUuid }, attributes: [key] });
        if (result) {
            return { uuid: result[key], category: category as categoryType };
        }
    }

    return { uuid: refererUuid, category: undefined };
}

export async function AttachmentHelper(
    req: Request, uid: string,
    refererUuid: any, category: categoryType,
    files: FileInfo[],
    t: any
): Promise<any[]> {

    if (!files || files.length === 0) {
        throw new InternalError(CODE.NoContent, "파일이 존재하지 않습니다.");
    }

    const { uuid: validrefererUuid, category: refererCategory } = await getRefererUuid(refererUuid);

    const attachments = await Promise.all(files.map(async (file: any) => {
        const type = req.body.type ? req.body.type : file.mime.split('/')[0];
        const attachment = new Attachment({
            ...req.body,
            uuid: uuidv4(),
            name: file.name,
            origin: file.origin,
            size: file.size,
            path: file.path,
            format: file.mime,
            type,
            creatorId: uid,
            refererUuid: validrefererUuid || refererUuid,
            category: category !== null ? category : (refererCategory || undefined),
            enable: false
        });

        const savedAttachment = await attachment.save({ transaction: t });

        if (!savedAttachment.uuid || !savedAttachment.name || !savedAttachment.path) {
            throw new InternalError(CODE.BadRequest, '파일 저장을 실패하였습니다.');
        }

        return {
            uuid: savedAttachment.uuid,
            name: savedAttachment.name,
            origin: savedAttachment.origin,
            size: savedAttachment.size,
            path: savedAttachment.path,
            format: savedAttachment.format,
            type: savedAttachment.type,
            enable: savedAttachment.enable,
            creatorId: savedAttachment.creatorId,
            createdAt: savedAttachment.createdAt
        };
    }));

    return attachments;
}
