import bodyParser from 'body-parser'
import cluster from 'cluster'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import http from 'http'
import moment from 'moment'
import logger from 'morgan'
import os from 'os'
import swaggerUi from 'swagger-ui-express'
import * as url from 'url'
import Passport from './src/common/Passport'
import { tokenSetup } from './src/common/Token'
import env from './src/common/env'
import { sequelizeInit } from './src/common/sequelize'
import config from './src/configs/config'
//import UserController from './src/controller/clientController/UserController'
import errorHandler from './src/middlewares/errorHandler'
import router from './src/routes/index'
import { specs } from './src/swagger/swagger.script'

env.load();
env.log();

logger.token('date', () => {
    return moment().format('YYYY-MM-DD HH:mm:ss Z');
});

const launch = (): express.Express => {


    sequelizeInit(config.database)
        .then(() => {
            // console.log('Database connect successful!');
        })
        .catch((error) => {
            process.exit(1);
        });

    tokenSetup({
        cryptoLength: env.JWT_CRYPTO_LENGTH,
        secretOrKey: env.JWT_SECRETKEY,
        expiresIn: env.JWT_EXPIRATION_ACCESS,
        expiresRefresh: env.JWT_EXPIRATION_REFRESH,
        issuer: env.JWT_ISSUER,
    });

    const app = express();

    // all environments
    app.set('etag', false);
    app.use(logger('[:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
    app.use(express.json({ limit: 50 * 1024 * 1024 })); // set 50m, default 100kb
    app.use(express.urlencoded({ limit: 500 * 1024 * 1024, parameterLimit: 50000, extended: true }));
    app.use(cors());
    app.use(express.static(config.storage.static));
    app.use(bodyParser.json());

    app.use(session({
        secret: "'}w]eN-Y@jwt'n:N ",
        resave: false,
        saveUninitialized: true
    }));

    app.use(Passport.initialize());
    app.use(Passport.session());

    //token -> 쿠키
    app.use(cookieParser());

    //DB연동(사용자 정보 확인)
    // Passport.local({
    //     session: false,
    //     usernameField: env.PASSPORT_USERNAME,
    //     passwordField: env.PASSPORT_PASSWORD,
    // }, UserController.login);

    // 토큰 유효성 확인
    Passport.jwt({
        session: false,
        secretOrKey: env.JWT_SECRETKEY || "'}w]eN-Y@jwt'n:N ",
        expiresIn: env.JWT_EXPIRATION_ACCESS,
        expirationRefresh: env.JWT_EXPIRATION_REFRESH,
        accessName: env.JWT_ACCESS_NAME,
        refreshName: env.JWT_REFRESH_NAME,
    });

    console.log('express env : ', app.get('env'));
    console.log('process env : ', process.env.NODE_ENV);

    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs, {
        customCssUrl: '/swagger/swagger.css',
    }));

    app.use('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {

        try {
            // 관리자 페이지에서의 접근
            const referer = url.parse(req.headers.referer || '', false);
            res.locals.adminMode = referer.path === '/admin';
        } catch (error) {
        }
        next();
    });

    app.use('/', Passport.authenticate);
    app.use('/', router);
    app.use(errorHandler);

    const server = http.createServer(app);
    server.listen(config.port, function () {
        console.log('Express server listening on port ' + config.port);
    });

    return app;
}

let Hotube: express.Express | undefined = undefined;

if (process.env.NODE_ENV === 'production') {

    if (cluster.isPrimary) {
        console.log('master');
        console.info('process.env.NODE_ENV : ', process.env.NODE_ENV);

        cluster.schedulingPolicy = cluster.SCHED_RR;

        console.log('os cpu : ', os.cpus().length);
        if (os.cpus().length >= 2) {
            // 각 프로세별로 커넥션 풀을 사용(too many connection 발생)
            for (let i = 0; i < 2; i++) {
                cluster.fork();
            }
        } else {

            // cpus 갯수만큼 워커생성
            os.cpus().forEach(function (cpu: os.CpuInfo) {
                cluster.fork();
            });
        };

        cluster.on('online', (worker: any) => {
            console.log('create worker id : ' + worker.process.pid);
        });

        cluster.on('exit', (worker: any, code: number, signal: string) => {

            console.log('exit worker id : ' + worker.process.pid);
            console.log('exit code : ' + code);
            console.log('exit worker signal : ' + signal);

            cluster.fork();
        });

    } else {
        Hotube = launch();
    };
} else {
    Hotube = launch();
};

export default Hotube;
