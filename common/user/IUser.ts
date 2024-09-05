export default interface IUser {
    uid: string;
    name?: string;
    password?: string;
    birthday?: string;
    thumbnailId?: string;
    email: string;
    phone?: string;
    createdAt: Date;
    updatedAt?: Date;
}