export default interface IVerificationCode {
    uuid: string;
    type: verficationType;
    code: string;
    uid?: string;
    expireAt?: Date;
    createdAt: Date;
};

export enum verficationType {
    PASSWORD = 'PASSWORD',
    ID = 'ID',
    PHONE = 'PHONE'
};