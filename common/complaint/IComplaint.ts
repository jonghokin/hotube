export default interface IComplaint {
    uuid: string;
    refererUuid: string;
    uid: string;
    complaintCategory: complaintCategory;
    createdAt: Date;
}

export enum complaintCategory {
    CONTENT = 'content',
    REPLY = 'reply'
};