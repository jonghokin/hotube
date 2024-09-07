export default interface IReply {
    uuid: string;
    contentUuid: string;
    parentUuid?: string;
    complaintCount?: number;
    description?: string;
    creatorId?: string;
    createdAt: Date;
    updatedAt?: Date;
}