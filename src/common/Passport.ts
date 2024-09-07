import express from 'express';
import _ from 'lodash';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions, StrategyOptionsWithRequest, VerifiedCallback } from 'passport-jwt';
import { IStrategyOptionsWithRequest, IVerifyOptions, Strategy as LocalStrategy } from 'passport-local';
import Token, { T_Payload, TokenType } from './Token';
import CODE, { HttpError } from './code';
import { TokenExpiredError, VerifyErrors } from 'jsonwebtoken';
import InternalError from './InternalError';

// passport 를 Passport 로 확장처리, 커스텀 기능을 추가
export enum Strategy {
    LocalStrategy = 'LocalStrategy',
    JwtStrategy = 'JwtStrategy',
};

export interface PassportOption {
    session: boolean,
};

export interface PassportLocalOption extends PassportOption {
    usernameField?: string,
    passwordField?: string,
};

export interface PassportJWTOption extends PassportOption {
    secretOrKey?: string,
    expiresIn?: string | number,
    expirationRefresh?: string | number,
    accessName: string,
    refreshName: string,
};

const options: { LocalStrategy: PassportLocalOption, JwtStrategy: PassportJWTOption } = {
    LocalStrategy: {
        usernameField: 'uid',
        passwordField: 'password',
        session: false,
    },
    JwtStrategy: {
        session: false,
        accessName: 'access',
        refreshName: 'refresh',
    },
};

export default class Passport {

    static initialize() {
        return passport.initialize();
    };

    static session() {
        return passport.session();
    };

    static local(option: PassportLocalOption, callback: any) {
        options.LocalStrategy = option;

        // LocalStrategy
        passport.use(Strategy.LocalStrategy, new LocalStrategy({
            usernameField: options.LocalStrategy.usernameField,
            passwordField: options.LocalStrategy.passwordField,
            session: options.LocalStrategy.session,
            passReqToCallback: true
        } as IStrategyOptionsWithRequest, callback));
    };

    static jwt(option: PassportJWTOption) {
        options.JwtStrategy = option;

        // JwtStrategy
        passport.use(Strategy.JwtStrategy, new JwtStrategy({
            // jwtFromRequest: ExtractJwt.fromExtractors([
            //     (req) => req.cookies[options.JwtStrategy.accessName],
            //     (req) => req.cookies[options.JwtStrategy.refreshName],
            // ]),
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromHeader(options.JwtStrategy.accessName),
                ExtractJwt.fromHeader(options.JwtStrategy.refreshName)
            ]),
            passReqToCallback: true,
            ignoreExpiration: true,
            secretOrKey: options.JwtStrategy.secretOrKey,
            expiresIn: options.JwtStrategy.expiresIn,
            expirationRefresh: options.JwtStrategy.expirationRefresh,
        } as StrategyOptionsWithRequest, (req: express.Request, payload: any, done: VerifiedCallback) => {

            try {
                console.log(`Passport, JwtStrategy, payload : `, JSON.stringify(payload));
            } catch (error) { }

            Passport.verify(req, payload)
                .then((decrypt) => {
                    console.log(`Passport, JwtStrategy, verify : `, decrypt);

                    if (decrypt) {
                        done(null, decrypt);
                    } else {
                        done(null, false);
                    }
                })
                .catch((error) => {
                    done(error, false);
                });
        }));
    };

    static signin(req: express.Request, res: express.Response, next: express.NextFunction) {
        passport.authenticate(Strategy.LocalStrategy, { session: options.LocalStrategy.session }, (err: Error, user: Express.User, info: IVerifyOptions) => {
            console.log('Passport.signin, payload : ', user);

            if (err) {
                console.log('Passport.signin, err : ', err);
                return next(err);
            };

            if (!user) {
                return next(new InternalError(CODE.Auth.Unauthorized, info.message));
            };

            req.login(user, { session: options.LocalStrategy.session }, (err) => {
                if (err) {
                    return next(err);
                } else {
                    if (!user) {
                        return next(new InternalError(CODE.Auth.Unauthorized));
                    };

                    console.log('Passport.signin.authenticated.login, err : ', err);
                    console.log('Passport.signin.authenticated.login, payload : ', user);

                    Token.create(user, true)
                        .then(({ access, refresh }) => {
                            // res.cookie(options.JwtStrategy.accessName, access);
                            // res.cookie(options.JwtStrategy.refreshName, refresh);
                            res.setHeader(options.JwtStrategy.accessName, access);
                            res.setHeader(options.JwtStrategy.refreshName, refresh);

                            console.log('Passport.signin access token >>  ', access);
                            console.log('Passport.signin refresh token >>  ', refresh);

                            res.locals.payload = user;
                            next();
                        })
                        .catch((err) => {
                            next(err);
                        });
                };
            });
        })(req, res, next);
    };

    static verify(req: express.Request, payload: any): Promise<T_Payload | void> {
        return new Promise<T_Payload | void>((resolve, reject) => {
            try {
                if (!payload) {
                    return resolve();
                };

                // const _access = req.cookies[options.JwtStrategy.accessName];
                // const _refresh = req.cookies[options.JwtStrategy.refreshName];
                const _access = req.headers[options.JwtStrategy.accessName];
                const _refresh = req.headers[options.JwtStrategy.refreshName];
                const _token = Buffer.from(`${_access || _refresh}`).toString();

                Token.verify(_token)
                    .then((decryptPayload) => resolve(decryptPayload))
                    .catch((error) => {
                        if (error instanceof TokenExpiredError) {
                            console.log(`Passport.verify expiredAt ${error?.expiredAt} >> `, error?.message);

                            // req.res?.clearCookie(options.JwtStrategy.accessName);
                            // req.res?.clearCookie(options.JwtStrategy.refreshName);
                            req.res?.setHeader(options.JwtStrategy.accessName, '');
                            req.res?.setHeader(options.JwtStrategy.refreshName, '');
                        } else {
                            console.log('Passport.verify error >> ', error?.message);
                        };

                        if (_access) {
                            reject(new InternalError(CODE.Auth.Expired));
                        } else {
                            reject(new InternalError(CODE.Auth.ExpiredRefresh));
                        };
                    });
            } catch (error) {
                reject(error);
            };
        });
    };

    static authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
        console.log('## Passport.authenticate ##');
        passport.authenticate(Strategy.JwtStrategy, { session: options.JwtStrategy.session }, (err: Error, user: Express.User, info: IVerifyOptions) => {
            console.log('Passport.authenticate, error : ', err);
            console.log('Passport.authenticate, user : ', user);

            const PATTERNS = [
                /POST:\/token/,
                /GET:\/content\/[^\/]/,
                /PUT:\/notice\/[^\/]/,
                /GET:\/home/,
                /GET:\/admin\/user/,
                /POST:\/admin\/company/,
                /DELETE:\/token/,
                /GET:\/token\/context/,
                /GET:\/test/,
                /POST:\/user/,
                /POST:\/email/,
                /PUT:\/user\/[^\/]+\/password\/verify/
            ];

            const method = req.method;
            const path = req.path;
            const requestPath = `${method}:${path}`;

            const isPatternMatched = PATTERNS.some((pattern) => pattern.test(requestPath));

            if (err) {
                if (err instanceof InternalError && isPatternMatched) {
                    next();
                } else {
                    next(err);
                };
            } else if (user && req.sessionID) {
                // Token.create(user, !!req.cookies[options.JwtStrategy.refreshName])
                Token.create(user, !!req.headers[options.JwtStrategy.refreshName])
                    .then(({ access, refresh }) => {
                        //res.cookie(options.JwtStrategy.accessName, access);
                        res.setHeader(options.JwtStrategy.accessName, access);

                        if (refresh) {
                            //res.cookie(options.JwtStrategy.refreshName, refresh);
                            res.setHeader(options.JwtStrategy.refreshName, refresh);
                        }

                        res.locals.payload = user;
                        next();
                    })
                    .catch((error) => {
                        console.log('Passport.authenticate error >> ', error?.message);
                        next(err);
                    });
            } else {
                if (isPatternMatched) {
                    next();
                } else {
                    next(new InternalError(CODE.Auth.Unauthorized));
                }
            };
        })(req, res, next);
    };

    static signout(req: express.Request, res: express.Response, next: express.NextFunction) {
        req.logOut({ keepSessionInfo: false }, (error) => {
            if (error) {
                next(error);
            };

            // res.clearCookie(options.JwtStrategy.accessName);
            // res.clearCookie(options.JwtStrategy.refreshName);
            res.setHeader(options.JwtStrategy.accessName, '');
            res.setHeader(options.JwtStrategy.refreshName, '');

            req.session.destroy((error) => {
                if (error) {
                    next(error);
                };

                next();
            });
        });
    };
};
