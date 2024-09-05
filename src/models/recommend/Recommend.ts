import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import IRecommend, { recommendType } from '../../../common/recommend/IRecommend';
import Content from '../content/IContent';
import User from '../user/User';

export interface RecommendAttr extends IRecommend {
}

@Table({ tableName: 'Recommend', charset: 'utf8', updatedAt: false })
export default class Recommend extends Model<IRecommend> {

    @PrimaryKey
    @ForeignKey(() => Content)
    @Column({ type: DataType.STRING(45), allowNull: false })
    contentUuid: string;

    @PrimaryKey
    @ForeignKey(() => User)
    @Column({ type: DataType.STRING(45), allowNull: false })
    uid: string;

    @Column({ type: DataType.ENUM('LIKE', 'HATE') })
    type: recommendType;

    @CreatedAt
    @Column({ type: DataType.DATE, allowNull: false })
    createdAt: Date;

    //------------------------------------

    @BelongsTo(() => Content, 'contentUuid')
    content?: Content;

    @BelongsTo(() => User, 'uid')
    user?: User;
}