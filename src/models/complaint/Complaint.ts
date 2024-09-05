import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import IComplaint, { complaintCategory } from '../../../common/complaint/IComplaint';
import User from '../user/User';

export interface ComplaintAttr extends IComplaint {
}

@Table({ tableName: 'Complaint', charset: 'utf8', updatedAt: false })
export default class Complaint extends Model<IComplaint> {

    @PrimaryKey
    @Column({ type: DataType.STRING(45), allowNull: false, defaultValue: DataType.UUIDV4 })
    uuid: string;

    @Column({ type: DataType.STRING(45), allowNull: false })
    refererUuid: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.STRING(45), allowNull: false })
    uid: string;

    @Column({ type: DataType.ENUM('CONTENT', 'REPLY') })
    complaintCategory: complaintCategory;

    @CreatedAt
    @Column({ type: DataType.DATE, allowNull: false })
    createdAt: Date;

    //------------------------------------

    @BelongsTo(() => User, 'uid')
    user?: User;
}