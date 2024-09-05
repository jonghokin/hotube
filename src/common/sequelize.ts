import _ from 'lodash';
import path from 'path';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';

export const sequelizeInit = async (option: SequelizeOptions) => {

    // console.log('sequelizeInit param : ', option);

    const paths = (option.models as string[])?.map(model => {
        return path.join(__dirname, model.toString())
    });

    const merge = _.merge({
        dialect: 'mysql',
        define: {
            timestamps: false
        },
        timezone: '+09:00',
        pool: {
            max: 10,
            min: 10,
            acquire: 60000,
            idle: 10000
        },
        modelMatch: (filename: string, member: string) => {
            return (filename !== 'index') && (member !== 'index') && (filename === member);
        },
    }, _.clone(option), { models: paths });

    console.log('sequelize option : ', merge);

    const sequelize = new Sequelize(_.merge(merge, {
        modelMatch: (filename: string, member: string) => {
            return (filename !== 'index') && (member !== 'index') && (filename === member);
        },
    }));

    return sequelize.databaseVersion()
    .then((databaseVersion) => {
        console.log(`Sequelize Database version : ${databaseVersion}`);
        return sequelize.authenticate();
    });
};