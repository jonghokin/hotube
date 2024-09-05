import { Column, CreatedAt, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import ICategory from '../../../common/category/ICategory';
import Content from '../content/IContent';

export interface CategoryAttr extends ICategory {
    contents?: Content[];
}

@Table({ tableName: 'Category', charset: 'utf8', updatedAt: false })
export default class Category extends Model<ICategory> {

    @PrimaryKey
    @Column({ type: DataType.STRING(45), allowNull: false, defaultValue: DataType.UUIDV4 })
    uuid: string;

    @Column({ type: DataType.STRING(45), allowNull: false })
    name: string;

    @CreatedAt
    @Column({ type: DataType.DATE, allowNull: false })
    createdAt: Date;

    //------------------------------------

    @HasMany(() => Content, 'categoryUuid')
    contents: Content[];
}