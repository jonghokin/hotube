export default interface IContent {
    uuid: string;
    thumbnailId?: string;
    categoryUuid: string;
    channelUuid: string;
    title: string;
    tag?: string;
    description?: string;
    creatorId?: string;
    createdAt: Date;
}