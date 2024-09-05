export interface ErrorCode {
    code: number,
    message: string,
}

const CODE = {
    OK: {
        code: 200,
        message: 'OK',
    },
    Created: {
        code: 201,
        message: 'Created',
    },
    NoContent: {
        code: 203,
        message: 'No Content', // 204로 내려주게 되면 body 부분이 없으므로 result 값을 받을수 없다.
    },
    BadRequest: {
        code: 400,
        message: 'BadRequest',
    },
    NotFound: {
        code: 404,
        message: 'NotFound',
    },
    Conflict:{
        code: 405,	// 동일한 데이터가 존재합니다.
        message: 'Conflict'
    },
    UnprocessableEntity: {
        code: 422,
        message: 'UnprocessableEntity'
    },
    TooManyRequests: {
        code: 429,
        message: '사용량이 초과되었습니다.',
    },
    DatabaseError: {
        ValidationError: {
            code: 500,
            message: 'ValidationError'
        },
        ConstraintError: {
            code: 500,
            message: 'ConstraintError'
        }
    },
    InternalServerError: {
        code: 500,
        message: 'InternalServerError',
    },
    Sns: {
        NotFoundDevice: {
            code: 500,
            message: 'Sns.NotFoundDevice',
        },
    },
    Auth: {
        PinReset: {
            code: 210,
            message: 'Auth.PinReset',
        },
        PasswordExpired: {
            code: 211,
            message: 'Auth.PasswordExpired',
        },
        Unauthorized: {
            code: 401,
            message: 'Auth.Unauthorized',
        },
        Invalid:{
            code: 402,
            message: 'Auth.Invalid',
        },
        Expired: {
            code: 403,
            message: 'Auth.Expired'
        },
        ExpiredRefresh: {
            code: 408,
            message: 'Auth.Expired.Refresh'
        },
        Gone:{
            code: 409,
            message: 'Auth.Gone',
        },
        PasswordReset: {
            code: 410,
            message: 'Auth.PasswordReset',
        }
    },
    SignIn: {
        NeedUserID: {
            code: 500,
            message: 'SignIn.NeedUserID',
        },
    },
    Legacy: {
        Created: {
            code: 201,
            message: 'Created',
        },
        NoContent: {
            code: 204,
            message: 'No Content',
        },
        Auth: {
            Unauthorized: {
                code: 401,
                message: 'Legacy.Auth.Unauthorized'
            },
            Invalid: {
                code: 402,
                message: 'Legacy.Auth.Invalid'
            },
            Expired: {
                code: 403,
                message: 'Legacy.Auth.Expired'
            },
            ExpiredRefresh: {
                code: 408,
                message: 'Legacy.Expired.Refresh'
            },
        },
        InternalServerError: {
            code: 500,
            message: 'InternalServerError',
        },
    }
};

export class HttpError extends Error {
    status: number;

    constructor(code: ErrorCode) {
        super(code.message);

        this.status = code.code;
    };
};

export default CODE;

