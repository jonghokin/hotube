export default interface IChannel {
    uuid: string;
    uid?: string;
    name: string;
    introduce?: string;
    ownerId?: string;
    createdAt: Date;
    updatedAt?: Date;
}