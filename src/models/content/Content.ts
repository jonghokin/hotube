import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import IContent, { statusType } from '../../../common/content/IContent';
import Attachment from '../attachment/Attachment';
import Category from '../category/Category';
import Channel from '../channel/Channel';
import User from '../user/User';
import Recommend from '../recommend/Recommend';
import Reply from '../reply/Reply';
import Watch from '../watch/Watch';

export interface ContentAttr extends IContent {
    category?: string;
    complaint?: boolean; //신고
}

@Table({ tableName: 'Content', charset: 'utf8', updatedAt: false })
export default class Content extends Model<IContent> {

    @PrimaryKey
    @Column({ type: DataType.STRING(45), allowNull: false, defaultValue: DataType.UUIDV4 })
    uuid: string;

    @ForeignKey(() => Attachment)
    @Column({ type: DataType.STRING(45) })
    thumbnailId?: string;

    @ForeignKey(() => Category)
    @Column({ type: DataType.STRING(45), allowNull: false })
    categoryUuid: string;

    @ForeignKey(() => Channel)
    @Column({ type: DataType.STRING(45), allowNull: false })
    channelUuid: string;

    @Column({ type: DataType.ENUM('NORMAL', 'BLIND', 'RESTORE'), defaultValue: 'NORMAL' })
    status?: statusType;

    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    complaintCount?: number;

    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    viewCount?: number;

    @Column({ type: DataType.STRING(128), allowNull: false })
    title: string;

    @Column({ type: DataType.TEXT })
    tag?: string;

    @Column({ type: DataType.TEXT })
    description?: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.STRING(45) })
    creatorId?: string;

    @CreatedAt
    @Column({ type: DataType.DATE, allowNull: false })
    createdAt: Date;

    //------------------------------------

    @BelongsTo(() => Attachment, 'thumbnailId')
    thumbnail?: Attachment;

    @BelongsTo(() => Category, 'categoryUuid')
    category?: Category;

    @BelongsTo(() => Channel, 'channelUuid')
    channel?: Channel;

    @BelongsTo(() => User, 'creatorId')
    creator?: User;

    @HasMany(() => Recommend, 'contentUuid')
    recommends?: Recommend[]

    @HasMany(() => Reply, 'contentUuid')
    replies?: Reply[]

    @HasMany(() => Watch, 'contentUuid')
    watchs?: Watch[]
}