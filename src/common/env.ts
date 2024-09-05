import dotenv from 'dotenv';
import _ from 'lodash';

export interface Env {
    HTTP_PORT?: number,
    EXPRESS_PORT?: number,
    PASSPORT_USERNAME?: string,
    PASSPORT_PASSWORD?: string,
    PASSPORT_SESSION?: boolean,
    JWT_CRYPTO_LENGTH?: number,
    JWT_ACCESS_NAME: string,
    JWT_REFRESH_NAME: string,
    JWT_SECRETKEY: string,
    JWT_ISSUER?: string,
    JWT_EXPIRATION_ACCESS?: number,
    JWT_EXPIRATION_REFRESH?: number,
    EMAIL_SECRET_KEY: string,
    EMAIL_TOKEN_EXPIRATION_SEC?: number,
    load: () => void,
    log: () => void,
};

let env: Env | any;

const log = () => {
    console.log(`\n\r환경변수\n\r`, env);
};

const load = () => {

    const { NODE_ENV } = process.env;
    console.info('NODE_ENV : ', NODE_ENV || 'NODE_ENV 를 설정하지 않고 디폴트설정으로 실행합니다.');

    if (NODE_ENV === 'local') {
        dotenv.config({ path: '.env.local' });
    } else {
        dotenv.config();
    }

    env = _.merge(env, {
        HTTP_PORT: process.env.HTTP_PORT ? Number(process.env.HTTP_PORT) : undefined,
        EXPRESS_PORT: process.env.EXPRESS_PORT ? Number(process.env.EXPRESS_PORT) : 8080,
        PASSPORT_USERNAME: process.env.PASSPORT_USERNAME || 'uid',
        PASSPORT_PASSWORD: process.env.PASSPORT_PASSWORD || 'password',
        PASSPORT_SESSION: Boolean(JSON.parse(process.env.PASSPORT_SESSION || 'false')),
        JWT_CRYPTO_LENGTH: Number(process.env.JWT_CRYPTO_LENGTH || 16),
        JWT_ACCESS_NAME: process.env.JWT_ACCESS_NAME || 'access',
        JWT_REFRESH_NAME: process.env.JWT_REFRESH_NAME || 'refresh',
        JWT_SECRETKEY: process.env.JWT_SECRETKEY || "'}h]oT-B@jwt'n:N",
        JWT_ISSUER: process.env.JWT_ISSUER || 'hotube',
        JWT_EXPIRATION_ACCESS: Number(process.env.JWT_EXPIRATION_ACCESS) || 1209600, //나중에 1800으로 변경
        JWT_EXPIRATION_REFRESH: Number(process.env.JWT_EXPIRATION_REFRESH) || 1209600, //14일
        EMAIL_TOKEN_EXPIRATION_SEC: Number(process.env.EMAIL_TOKEN_EXPIRATION_SEC) || 180,
        EMAIL_SECRET_KEY: process.env.EMAIL_SECRET_KEY || "'}h]oT-B@mail'n:N",
    });
};

env = {
    load: load,
    log: log,
};

export default env;