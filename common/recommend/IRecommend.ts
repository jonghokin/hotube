export default interface IRecommend {
    contentUuid: string;
    uid: string;
    type: recommendType;
    createdAt: Date;
}

export enum recommendType {
    LIKE = 'like',
    HATE = 'hate',
}