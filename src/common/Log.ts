
import debug from 'debug';
import express from 'express';
import _ from 'lodash';
import moment from 'moment';

const _debug = debug('p-city');
const log = _debug.extend('log');
const error = _debug.extend('error');

log.log = console.log.bind(console);

const { NODE_ENV = 'local' } = process.env;

export default class Log {

    //log(message?: any, ...optionalParams: any[]): void;
    public static log(req?: express.Request | string, title?: any, ...val: any[]) {

        try {

            let logData: any = {
                timestamp: moment().format('YYYY-MM-DD HH:mm:ss:SSS Z')
            };

            const timestamp = moment().format('YYYY-MM-DD HH:mm:ss:SSS Z');
            let sessionId = '-';
            let ipAddress = '-';
            let path = '-';
            let method = '-';
            let user = '-';
            let userAgent = '-';
            let params = '-';

            if (req) {

                if (typeof req === 'string') {

                    let _title = req;
                    let _val = title;
                    logData = _.merge(logData, {
                        title: _title,
                        val: _val,
                    });

                } else {

                    logData = _.merge(logData, {
                        ipAddress: req?.res?.locals?.ipAddress || '-',
                        user: req?.res?.locals?.user?.userId || req?.res?.locals?.user?.resortNo || '-',
                        sessionId: req?.sessionID || '-',
                        method: req?.method || '-',
                        path: req?.path || '-',
                        title: title,
                        val: val && val.length == 1 ? val[0] : val,
                        params: (req?.body) ? req.body : '-',
                        userAgent: req.headers['user-agent'] || '-'
                    });
                };
            };

            // if (!NODE_ENV || NODE_ENV === 'local' || NODE_ENV === 'development') {
                // console.log(`[${timestamp}::${ipAddress}::${user}::${sessionId}] "${method} ${path}" - ${logData.title}::`, logData.val && logData.val.length == 1 ? logData.val[0] : logData.val);
            // } else {
                console.log(JSON.stringify(logData));
            // }

        } catch (error) {
            console.error('## Logging(log) error...');
        };
    };
};