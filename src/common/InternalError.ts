import CODE from './code';

/**
 * 에러 객체
 */
export default class InternalError extends Error {

	code: { code: number, message?: string };
	cause: globalThis.Error;

	constructor(err: any, message?: string) {

		super(message || 'InternalError');
		Object.setPrototypeOf(this, InternalError.prototype);
		Error.captureStackTrace(this, this.constructor);

		this.code = {
			code: CODE.InternalServerError.code
		};

		if (err instanceof Error) {
			this.cause = err;
			this.code.message = err.message;
		} else {

			if (typeof err === 'number') { 
				this.code.code = err;
			} else {
				this.code.code = err.code;
			};
			
			this.code.message = message || err.message;
		};
	};
};