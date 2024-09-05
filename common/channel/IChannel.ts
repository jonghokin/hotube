export default interface IChannel {
    uuid: string;
    uid: string;
    name: string;
    introduce?: string;
    createdAt: Date;
    updatedAt?: Date;
}