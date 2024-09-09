import IUser from "../user/IUser";

export default interface IReply {
    uuid: string;
    contentUuid: string;
    parentUuid?: string | null;
    complaintCount?: number;
    pinned?: boolean;
    description?: string;
    creatorId?: string;
    createdAt: Date;
    updatedAt?: Date;
    isMyContent?: boolean;
    isMyReply?: boolean;
    creator?: IUser;
}