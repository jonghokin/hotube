import IUser from "../user/IUser";
import { recommendType } from "../recommend/IRecommend";

export default interface IContent {
    uuid: string;
    thumbnailId?: string;
    categoryUuid: string;
    channelUuid: string;
    status?: statusType;
    complaintCount?: number;
    viewCount?: number;
    title: string;
    tag?: string;
    description?: string;
    creatorId?: string;
    createdAt: Date;
    subscribeCount?: number; //구독자수
    replyCount?: number;     //댓글수
    recommendCount?: number; //좋아요, 싫어요수
    recommendType?: recommendType; //좋아요 또는 싫어요
    isComplaint?: boolean; //신고여부
    isSubscribe?: boolean; //구독여부
    isRecommend?: boolean; //좋아요, 싫어요 여부
    creator?: IUser; //작성자
}

export enum statusType {
    NORMAL = 'normal',
    BLIND = 'blind',
    RESTORE = 'restore'
}