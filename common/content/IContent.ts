export default interface IContent {
    uuid: string;
    thumbnailId?: string;
    categoryUuid: string;
    channelUuid: string;
    viewCount?: number;
    title: string;
    tag?: string;
    description?: string;
    creatorId?: string;
    createdAt: Date;
}