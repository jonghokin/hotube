import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator'
import InternalError from '../common/InternalError'
import CODE from '../common/code'
import response from '../common/response';

export default function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {

    console.log('This is errorhandler');

    if (error instanceof InternalError) {
        response(req, res, error);
    } else {
        response(req, res, new InternalError(error));
    }
};

const translateMessages = (req: Request, errObj: any) => {
	// Convert the errObj to an Array
	const errArr = Object.entries(errObj);

	var errorString: any = [];
	// For each array(err), compare the error msg with the polyglot phrases, and replace it.
	errArr.forEach((err: any) => {
		// Object.keys(req.polyglot.phrases).forEach(phrase => {

		// 	if (phrase === err[1].msg) {
		// 		errorString.push(req.polyglot.t(phrase));
		// 	}
		// });

        errorString.push(err[1].msg);
	});

	return errorString.join();
};

const customValidationResult = validationResult.withDefaults({
	formatter: (error: any) => {
		console.log(error);
		return {
			msg: error.msg,
		};
	}
});

export const validationError = (req: Request, res: Response, next: NextFunction) => {

	const validationErrors = customValidationResult(req);

	if (!validationErrors.isEmpty()) {
		return response(req, res, new InternalError(CODE.UnprocessableEntity, translateMessages(req, validationErrors.mapped())));
	} else {
		// If no errors
		next();
	}
};