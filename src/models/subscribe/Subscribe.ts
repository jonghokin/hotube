import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import ISubscribe from '../../../common/subscribe/ISubscribe';
import Channel from '../channel/Channel';
import User from '../user/User';

export interface SubscribeAttr extends ISubscribe {
}

@Table({ tableName: 'Subscribe', charset: 'utf8', updatedAt: false })
export default class Subscribe extends Model<ISubscribe> {

    @PrimaryKey
    @ForeignKey(() => Channel)
    @Column({ type: DataType.STRING(45), allowNull: false })
    channelUuid: string;

    @PrimaryKey
    @ForeignKey(() => User)
    @Column({ type: DataType.STRING(45), allowNull: false })
    uid: string;

    @CreatedAt
    @Column({ type: DataType.DATE, allowNull: false })
    createdAt: Date;

    //------------------------------------

    @BelongsTo(() => Channel, 'channelUuid')
    channel?: Channel;

    @BelongsTo(() => User, 'uid')
    user?: User;
}