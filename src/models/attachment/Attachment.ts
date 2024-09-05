import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';
import IAttachment, { categoryType } from '../../../common/attachment/IAttachment';
import User from '../user/User';

export interface AttachmentAttr extends IAttachment {
}

@Table({ tableName: 'Attachment', charset: 'utf8', updatedAt: false })
export default class Attachment extends Model<IAttachment> {

    @PrimaryKey
    @Column({ type: DataType.STRING(45), allowNull: false, defaultValue: DataType.UUIDV4 })
    uuid: string;

    @Column({ type: DataType.ENUM('USER', 'CONTENT') })
    category?: categoryType;

    @Column({ type: DataType.STRING(255) })
    refererUuid?: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: 1 })
    enable?: boolean;

    @Column({ type: DataType.STRING(255) })
    name?: string;

    @Column({ type: DataType.STRING(255) })
    origin?: string;

    @Column({ type: DataType.DOUBLE })
    size?: number;

    @Column({ type: DataType.TEXT })
    path?: string;

    @Column({ type: DataType.STRING(45) })
    type?: string;

    @Column({ type: DataType.STRING(45) })
    format?: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.STRING(45) })
    creatorId?: string;

    @CreatedAt
    @Column({ type: DataType.DATE, allowNull: false })
    createdAt: Date;

    //------------------------------------
    @BelongsTo(() => User, 'creatorId')
    creator?: User;
}