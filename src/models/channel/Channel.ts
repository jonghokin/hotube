import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript';
import IChannel from '../../../common/channel/IChannel';
import User from '../user/User';
import Content from '../content/Content';
import Subscribe from '../subscribe/Subscribe';

export interface ChannelAttr extends IChannel {
    contents?: Content[];
    cancel?: boolean;
}

@Table({ tableName: 'Channel', charset: 'utf8' })
export default class Channel extends Model<IChannel> {

    @PrimaryKey
    @Column({ type: DataType.STRING(45), allowNull: false, defaultValue: DataType.UUIDV4 })
    uuid: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.STRING(45) })
    uid?: string;

    @Column({ type: DataType.STRING(45), allowNull: false })
    name: string;

    @Column({ type: DataType.TEXT })
    introduce?: string;

    @Column({ type: DataType.STRING(45) })
    ownerId?: string;

    @CreatedAt
    @Column({ type: DataType.DATE, allowNull: false })
    createdAt: Date;

    @UpdatedAt
    @Column({ type: DataType.DATE })
    updatedAt?: Date;

    //------------------------------------
    @BelongsTo(() => User, 'uid')
    user?: User;

    @BelongsTo(() => User, 'ownerId')
    owner?: User;

    @HasMany(() => Content, 'channelUuid')
    contents?: Content[];

    @HasMany(() => Subscribe, 'channelUuid')
    subscribes?: Subscribe[];
}