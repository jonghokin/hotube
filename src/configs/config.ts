import _ from 'lodash';
import * as dotenv from 'dotenv';
import dev from './config.dev.json';
import common from './config.json';
import prod from './config.prod.json';
import env from '../common/env';
import path from 'path';
import nodemailer from 'nodemailer';

dotenv.config();
env.load();
env.log();

const { NODE_ENV } = process.env;

console.info('config >> NODE_ENV : ', NODE_ENV);

// 로컬 / 개발계 / 테스트계 / 운영계로 구분된다.
let config: any = NODE_ENV === 'production' ? _.merge(common, prod) : _.merge(common, dev);

console.log(`sysconfig : `, JSON.stringify(config));

interface App {
    name: string;
}

interface Database {
    connectionLimit: number;
    host: string;
    port: number;
    username: string;
    database: string;
    password: string;
    dialect: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'mariadb' | 'oracle';
    dialectOptions: Object,
    multipleStatements: boolean;
    timezone: string;
    logging: boolean;
    logQueryParameters: boolean;
    pool: any;
}

interface Backend {
    port: number;
    proxyIdentifier?: string;
    geoIP?: {
        key: string;
    };
    passport: {
        jwt: {
            secretOrKey: string,
            expiresIn?: number,
            expirationRefresh?: number,
        },
        singleSession: boolean
    },
    external: {
        knock: string;
    },
    axios: {
        timeout: number //ms
    }
}

interface Elasticsearch {
    host: string
    timeout?: number
}

interface Storage {
    static: string,
    path: string,
    s3: {
        bucket: string,
        url?: string
    }
}

interface Scheduler {

    bigwork?: string,
    content?: string,
    innovation?: string,
    activePoint?: string,
    point?: string,
}

export interface Config {
    app: App,
    port: number;
    database: Database,
    storage: Storage,
    backend: Backend,
    elasticsearch?: Elasticsearch,
    scheduler?: Scheduler
}

export default config;