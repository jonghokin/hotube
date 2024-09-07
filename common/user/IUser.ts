import IAttachment from "../attachment/IAttachment";

export default interface IUser {
    uid: string;
    name?: string;
    password?: string;
    birthday?: string;
    thumbnailId?: string;
    email: string;
    phone?: string;
    createdAt: Date;
    updatedAt?: Date;
    thumbnail?: IAttachment, //썸네일
    channelName?: string //채널명
}