import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript';
import IUser from '../../../common/user/IUser';
import Attachment from '../attachment/Attachment';
import Channel from '../channel/Channel';
import Recommend from '../recommend/Recommend';
import Complaint from '../complaint/Complaint';
import Subscribe from '../subscribe/Subscribe';
import Reply from '../reply/Reply';
import Watch from '../watch/Watch';

export interface UserAttr extends IUser {
    checkPassword?: string;
}

@Table({ tableName: 'User', charset: 'utf8' })
export default class User extends Model<IUser> {

    @PrimaryKey
    @Column({ type: DataType.STRING(45), allowNull: false })
    uid: string;

    @Column({ type: DataType.STRING(45), allowNull: false })
    name: string;

    @Column({ type: DataType.STRING(128), allowNull: false })
    password: string;

    @Column({ type: DataType.STRING(10) })
    birthday?: string;

    @ForeignKey(() => Attachment)
    @Column({ type: DataType.STRING(45) })
    thumbnailId?: string;

    @Column({ type: DataType.STRING(128), allowNull: false })
    email: string;

    @Column({ type: DataType.STRING(16) })
    phone?: string;

    @CreatedAt
    @Column({ type: DataType.DATE, allowNull: false })
    createdAt: Date;

    @UpdatedAt
    @Column({ type: DataType.DATE })
    updatedAt?: Date;

    //------------------------------------
    @BelongsTo(() => Attachment, 'thumbnailId')
    thumbnail?: Attachment;

    @HasOne(() => Channel, 'ownerId')
    owner?: Channel;

    @HasMany(() => Complaint, 'uid')
    complaints?: Complaint[]

    @HasMany(() => Recommend, 'uid')
    recommends?: Recommend[]

    @HasMany(() => Subscribe, 'uid')
    subscribes?: Subscribe[]

    @HasMany(() => Reply, 'creatorId')
    replies?: Reply[]

    @HasMany(() => Watch, 'uid')
    watches?: Watch[]
}