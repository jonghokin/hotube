import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript';
import IWatch from '../../../common/watch/IWatch';
import Content from '../content/IContent';
import User from '../user/User';

export interface WatchAttr extends IWatch {
}

@Table({ tableName: 'Watch', charset: 'utf8', updatedAt: false })
export default class Watch extends Model<IWatch> {

    @PrimaryKey
    @ForeignKey(() => Content)
    @Column({ type: DataType.STRING(45), allowNull: false })
    contentUuid: string;

    @PrimaryKey
    @ForeignKey(() => User)
    @Column({ type: DataType.STRING(45), allowNull: false })
    uid: string;

    @CreatedAt
    @Column({ type: DataType.DATE, allowNull: false })
    createdAt: Date;

    //------------------------------------

    @BelongsTo(() => Content, 'contentUuid')
    content?: Content;

    @BelongsTo(() => User, 'uid')
    user?: User;
}