import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import Debug from 'debug';
import { Request } from 'express';
import { IncomingMessage } from 'http';
import https from 'https';
import config from '../configs/config';
import InternalError from './InternalError';
import Log from './Log';
import CODE from './code';
import { APIResponse } from './response';
const { NODE_ENV = 'local' } = process.env;

export const enum ExternalService {
    knock = 'knock',
}

const AGENT = new https.Agent({
    rejectUnauthorized: false
});

const AXIOS_REQUST_CONFIG: AxiosRequestConfig<any> = {
    //timeout: config.backend.axios.timeout, // 2min
    withCredentials: true,
    httpsAgent: AGENT
};

export const external = <T>(param: AxiosRequestConfig<any>, service: ExternalService = ExternalService.knock, req?: Request, retryCount = 1): Promise<APIResponse<T>> => {

    Log.log(req, `Util.external, service(${service}) params`, param);
    Log.log(req, `Util.external, service headers`, req?.headers ? JSON.stringify(req.headers) : '__EMPTY__');

    return new Promise((resolve, reject) => {

        Promise.resolve()
            .then(() => {

                const idx = param.url?.indexOf('?') || -1;
                const url = param.url?.substring(0, idx > 0 ? idx : param.url.length);
                if (!url) {
                    throw new Error(CODE.InternalServerError.message);
                };

                param = Object.assign({}, AXIOS_REQUST_CONFIG, param);

                if (req) {
                    param.headers = Object.assign({}, param.headers, { 'x-forwarded-for': ipAddress(req) });
                };

                if (service === ExternalService.knock) {
                    param.url = `${config.backend.external.cms}${param.url}`;
                } ;
                
                Log.log(req, `Util.cms, request headers`, param.headers ? JSON.stringify(param.headers) : undefined);
                Log.log(req, `Util.cms, request param`, param.params ? JSON.stringify(param.params) : undefined);

                return axios(param);

            })
            .then((axiosres) => {

                Log.log(req, `Util.cms, response headers`, JSON.stringify(axiosres.headers));
                Log.log(req, `Util.cms, response status`, axiosres.status);
                Log.log(req, `Util.cms, response data`, JSON.stringify(axiosres.data));

                if (Math.floor(axiosres.status / 100) !== 2) {
                    throw new InternalError(CODE.Legacy.InternalServerError.code, axiosres.statusText);
                };

                resolve(axiosres.data);
            })
            .catch((error) => {
                Log.log(req, `Util.cms, error.message`, error.message);

                if (error instanceof AxiosError && error.response) {

                    Log.log(req, `Util.cms error response.header`, JSON.stringify(error.response?.headers));
                    if (error.response?.data) {
                        Log.log(req, `Util.cms error response.data`, error.response?.data);
                    };

                    let status = CODE.Legacy.InternalServerError.code;
                    reject(new InternalError(status, error.response?.data?.result?.message || error.message));
                };

                reject(error);
            });
    });
};

export const isPrivateAddress = (ip?: string): boolean => {

    const privatesBand = ['10', '192.168']; // 내부망 list
    const privates = ['1', '::1', '127.0.0.1', 'localhost']; // 내부망 list

    if (!ip) {
        return false;
    };

    const ips = ip.split('.');
    if (ips?.length === 4) {
        for (const e of privatesBand) {
            if (e === ips[0] || e === (`${ips[0]}.${ips[1]}`)) {
                return true;
            };
        };

        if (ips[0] === '172') {
            const octet = parseInt(ips[1]);
            if (octet >= 16 && octet <= 31) {
                return true;
            };
        };
    };

    for (const e of privates) {
        if (ip === e) {
            return true;
        };
    };

    return false;
};

export const ipAddress = (req?: IncomingMessage): string | undefined => {

    try {

        if (req) {

            // Log.log(req, '###### remote headers ip : ', req.headers['x-forwarded-for']);
            // Log.log(req, '###### remote connection ip : ', req.connection.remoteAddress);
            // Log.log(req, '###### remote socker ip : ', req.socket.remoteAddress);
            // Log.log(req, '###### remote ip : ', req.ip);
            // Log.log(req, '###### remote ips : ', req.ips);

            let ip: string | string[] | undefined = req.headers?.['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
            if (ip) {
                if (Array.isArray(ip)) {
                    ip = ip.pop();
                };

                if (ip?.indexOf(',') !== -1) {
                    ip = ip?.split(',')?.[0];
                };

                return ip?.split(':').pop();
            };
        };

    } catch (error) {
        Log.log('##ipAddress error >> ', error);
    };

    return;
};

export const hasOwnProperty = <X extends {}, Y extends PropertyKey>(obj: X, prop: Y): boolean => {
    return obj.hasOwnProperty(prop);
};

export const getProperty = <T extends {}, K extends keyof T>(o: T, propertyName: K): T[K] | undefined => {

    if (hasOwnProperty(o, propertyName)) {
        return o[propertyName];
    };

    return;
};