export default interface IAttachment {
    uuid: string;
    category?: categoryType;
    refererUuid?: string;
    enable?: boolean;
    name?: string;
    origin?: string;
    size?: number;
    path?: string;
    type?: string;
    format?: string;
    creatorId?: string;
    createdAt: Date;
}

export enum categoryType {
    USER = 'user',
    CONTENT = 'content',
}