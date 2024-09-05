import crypto from 'crypto';
import jwt, { VerifyErrors, SignOptions } from 'jsonwebtoken';
import CODE, { HttpError } from './code';
import _ from 'lodash';

let Token = {
    encrypt: (payload: any): string => { return ''; },
    decrypt: (payload: any): any => { return undefined; },
    create: (payload: any, needRefresh?: boolean): Promise<{ access: any, refresh: any }> => { return Promise.resolve({ access: undefined, refresh: undefined }); },
    verify: (token: any): Promise<any> => { return Promise.resolve(); }
};


export enum TokenType {
    AccessToken = 'access',
    RefreshToken = 'refresh',
};

export interface TokenOption {
    cryptoLength?: number,
    secretOrKey: string,
    expiresIn?: string | number,
    expiresRefresh?: string | number,
    issuer?: string,
};

export type T_Payload = {
    payload: Express.User
};

export const tokenSetup = (option: TokenOption) => {

    Token = _.assign(Token, {
        encrypt: (payload: any): string => {

            // const plain = JSON.stringify(payload);
            // // iv는 암호화 요청시마다 변경이 되므로 토큰에 포함되어야 한다.
            // const iv = crypto.randomBytes(option.cryptoLength);
            // const key = (option.secretOrKey || '').padEnd(32, '0');
            // const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
            // const encrypt = cipher.update(plain, 'utf8', 'base64').concat(cipher.final('base64'));

            // return `${iv.toString('hex')}:${encrypt}}`;
            return payload;
        }
    });

    Token = _.assign(Token, {
        decrypt: (payload: any): any => {

            // const parts = payload.split(':');
            // const iv = Buffer.from(parts.shift() || '', 'hex');
            // const key = (option.secretOrKey || '').padEnd(32, '0');
            // const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
            // const decrypt = decipher.update(parts.join(''), 'base64', 'utf8').concat(decipher.final('utf8'));

            // return JSON.parse(decrypt);

            return payload;
        }
    });

    Token = _.assign(Token, {
        create: (payload: any, needRefresh?: boolean): Promise<{ [key: string]: any }> => {

            return new Promise((resolve, reject) => {

                try {

                    const cookies: { [key: string]: any } = {
                        access: undefined,
                        refresh: undefined
                    };

                    cookies.access = jwt.sign({ payload: Token.encrypt(payload), ttype: TokenType.AccessToken }, option.secretOrKey || '', {
                        expiresIn: option.expiresIn,
                        issuer: option.issuer,
                    } as SignOptions);


                    if (needRefresh) {
                        cookies.refresh = jwt.sign({ payload: Token.encrypt(payload), ttype: TokenType.RefreshToken }, option.secretOrKey || '', {
                            expiresIn: option.expiresRefresh,
                            issuer: option.issuer,
                        } as SignOptions);
                    };
                    resolve(cookies);
                } catch (error) {
                    reject(error);
                };
            });
        }
    });

    Token = _.assign(Token, {
        verify: (token: string): Promise<T_Payload | void> => {

            return new Promise((resolve, reject) => {

                if (token && token !== 'undefined') {

                    jwt.verify(token, option.secretOrKey, (error: VerifyErrors | null, decoded: any | undefined) => {

                        console.log(`Token.verify, error : ${error}`);
                        console.log(`Token.verify, token : ${JSON.stringify(decoded)}`);
                        console.log(`Token.verify, token.ttype : ${decoded?.ttype}`);

                        if (error) {
                            // reject(new HttpError(CODE.Auth.Expired));
                            reject(error);
                        } else {
                            resolve(Token.decrypt(decoded.payload));
                        };
                    });
                } else {
                    // reject(new HttpError(CODE.BadRequest));
                    resolve();
                };
            });
        }
    });
};

export default Token;