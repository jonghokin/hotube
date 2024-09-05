import { BelongsTo, Column, Comment, CreatedAt, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import IVerificationCode from '../../../common/verification/IVerificationCode';
import { CommonSearchAttr } from '../../common/Common';
import User from '../user/User';

export interface VerificationCodeAttr extends IVerificationCode {
};

export interface VerificationCodeSearchAttr extends VerificationCodeAttr, CommonSearchAttr {
};

@Table({ tableName: 'VerificationCode', charset: 'utf8', updatedAt: false })
export default class VerificationCode extends Model<IVerificationCode> {

    @PrimaryKey
    @Column({ type: DataType.STRING(45), allowNull: false, defaultValue: DataType.UUIDV4 })
    uuid: string;

    @Column({ type: DataType.STRING(12), allowNull: false })
    code: string;

    @Column({ type: DataType.STRING(45) })
    uid?: string;

    @Column({ type: DataType.DATE, allowNull: false })
    expireAt: Date;

    @CreatedAt
    @Column({ type: DataType.DATE, allowNull: false })
    createdAt: Date;
};