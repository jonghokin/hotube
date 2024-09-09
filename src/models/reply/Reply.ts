import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript';
import IReply from '../../../common/reply/IReply';
import Content from '../content/Content';
import User from '../user/User';

export interface ReplyAttr extends IReply {
    complaint?: boolean;
}

@Table({ tableName: 'Reply', charset: 'utf8' })
export default class Reply extends Model<IReply> {

    @PrimaryKey
    @Column({ type: DataType.STRING(45), allowNull: false, defaultValue: DataType.UUIDV4 })
    uuid: string;

    @ForeignKey(() => Content)
    @Column({ type: DataType.STRING(45), allowNull: false })
    contentUuid: string;

    @ForeignKey(() => Reply)
    @Column({ type: DataType.STRING(45) })
    parentUuid?: string;

    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    complaintCount?: number;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    pinned?: boolean;

    @Column({ type: DataType.TEXT })
    description?: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.STRING(45) })
    creatorId?: string;

    @CreatedAt
    @Column({ type: DataType.DATE, allowNull: false })
    createdAt: Date;

    @UpdatedAt
    @Column({ type: DataType.DATE })
    updatedAt?: Date;

    //------------------------------------
    @HasMany(() => Reply, 'parentUuid')
    childReplies?: Reply[];

    @BelongsTo(() => Reply, 'parentUuid')
    parentReply?: Reply;

    @BelongsTo(() => Content, 'contentUuid')
    content?: Content;

    @BelongsTo(() => User, 'creatorId')
    creator?: User;
}