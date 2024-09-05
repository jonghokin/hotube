import express from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize';
import CODE from './code';
import InternalError from './InternalError';

export type APIResponseResult = {
    code: number,
    message?: string
};

export type APIResponse<T> = {
    result: APIResponseResult,
    body?: T
};

export default function (req: express.Request, res: express.Response, code?: any, data?: any) {
    try {
        const result = {
            code: code.code || CODE.OK.code,
            message: code.message || CODE.OK.message,
        };

        console.log('handleresponse code >> ', code);

        if (code instanceof InternalError) {
            // Log.error('response type : InternalError');
            result.code = code.code.code;
            result.message = code.code.message;
        } else if (code instanceof ForeignKeyConstraintError) {
            /* 외래키 무결성 에러 */
            // Log.error('response type : ForeignKeyConstraintError');
            result.code = CODE.DatabaseError.ConstraintError.code;
            result.message = CODE.DatabaseError.ConstraintError.message;
            result.message = result.message + '(' + code.fields + ')';
        } else if (code instanceof UniqueConstraintError) {
            /* 유일키 제약조건 에러 */
            // Log.error('response type : UniqueConstraintError');
            result.code = CODE.Conflict.code;
            result.message = CODE.Conflict.message;
        } else if (code instanceof ValidationError/* || code instanceof DatabaseError */) {
            /* Not NULL 제약조건 에러 */
            // Log.error('response type : UniqueConstraintError');
            result.code = CODE.DatabaseError.ValidationError.code;
            result.message = CODE.DatabaseError.ValidationError.message;
        } else if (code instanceof Error) {
            // Log.error('response type : Error');
            result.code = CODE.InternalServerError.code;
            result.message = CODE.InternalServerError.message;
        } else if (typeof code === 'object') {
            // Log.log('response type : object');
            result.code = code.code;
            result.message = code.message;
        } else {
            // Log.log('Can not found error type.');
        };

        const response: any = {
            result: result,
            context: undefined
        };

        // 로그인 사용자의 최소 정보
        response.context = {
            user: res.locals.payload,
            isLogin: !!res.locals.payload
        };

        if (data) {
            if (data.rows) {
                if (req.body.limit || req.body.offset) {
                    response.count = req.body.limit ? parseInt(req.body.limit) : 10;
                    response.page = req.body.offset ? Math.ceil(parseInt(req.body.offset) / response.count) + 1 : 1;
                    response.totalCount = Array.isArray(data.count) ? (<Array<any>>data.count).length : data.count;
                    response.totalPage = Math.ceil(response.totalCount / response.count);
                    if (response.totalPage > 0 && response.page > response.totalPage) {
                        response.page = response.totalPage - 1;
                    }
                }
                response.body = data.rows;
            } else {
                response.body = data;
            };
        };

        // 비밀번호 만료시 response
        if (req.method === 'POST' && req.originalUrl.startsWith('/token') && (res.locals.payload && res.locals.payload.passwordExpired)) {
            response.result.code = CODE.Auth.PasswordExpired.code;
            response.result.message = '비밀번호 기간이 만료되었습니다.';
        }

        // console.log('## response headers : ', JSON.stringify(res.getHeaders()));
        console.log('## response : ', response);
        res.status(response.result.code || 200).json(response);

    } catch (error) {
        console.log('## response error : ', error);
        res.status(500).json({ result: { code: 500, message: 'InternalError' } });
    };
};
