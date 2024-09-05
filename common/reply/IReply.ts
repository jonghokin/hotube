export default interface IReply {
    uuid: string;
    contentUuid: string;
    parentUuid?: string;
    description?: string;
    creatorId?: string;
    createdAt: Date;
    updatedAt?: Date;
}