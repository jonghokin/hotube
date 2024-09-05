import express from 'express';
import _ from 'lodash';
import { FindAndCountOptions, OrderItem } from 'sequelize';
import File from '../models/attachment/Attachment';
import { Sequelize } from 'sequelize-typescript';

export interface Request<T> extends Express.Request {
	body: T,
	query: any,
	params: any,
};

export default function bqparam(req: express.Request, res: express.Response, next: express.NextFunction) {

	// <P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = QueryString.ParsedQs, Locals extends Record<string, any> = Record<string, any>

	// console.log('req.body : ', req.body);
	// console.log('req.query : ', req.query);
	// console.log('req.params : ', req.params);

	req.body = _.merge(req.body, req.query, req.params);

	// Page 파라미터를 1 부터 시작하는 인덱스로 변환 처리
	const page = req.body as any;
	if (page.page || page.pageSize) {
		// const page = req.body as any;
		page.limit = page.pageSize ? parseInt(page.pageSize) : 10;
		page.offset = Math.max(0, page.page ? (parseInt(page.page) - 1) : 0) * page.limit;
	};

	if (res.locals.payload) {
		
		if (req.method === 'POST') {
			req.body.creator = res.locals.payload.uid;
		} else if (req.method === 'PUT') {
			req.body.updater = res.locals.payload.uid;
		} else if (req.method === 'DELETE') {
			req.body.deleter = res.locals.payload.uid;
		};
	};
	
	console.log('req.body : ', req.body);

	next();
};

export const findOptions = (req: express.Request, options: FindAndCountOptions): FindAndCountOptions => {

	const generateOrder = (orderByModel: string, orderBy: string): any[] => {

		const orderItem: any[] = [];
		const orderBySplits: string[] = orderBy.replace(/`/ig, '').split(' '); // items.item.name asc

		if (orderByModel && orderBySplits?.length > 0) {

			const models = orderByModel.split('.'); // InventoryMovementItem.Item
			const aliases = orderBySplits[0].split('.'); // items.item.name

			// aliases의 길이가 models 보다 1만 커야 함.
			if (models.length > 1 && aliases.length > 2 && (models.length + 1 === aliases.length)) {

				for (let i = 0; i < models.length; i++) {
					orderItem.push({
						model: File.sequelize?.models[`${models[i]}`] || File,
						as: `${aliases[i]}`
					});
				};
			} else {

				orderItem.push({
					model: File.sequelize?.models[`${models[0]}`] || File,
					as: `${aliases[0]}`
				});
			};

			orderItem.push(aliases[aliases.length - 1]);
			orderItem.push(orderBySplits.pop() || 'DESC');

		} else {
			orderItem.push(Sequelize.literal(orderBy));
		};

		return [orderItem];
	};

	if (req.body) {

		if (req.body.orderBy) {

			console.log('typeof req.bqe.orderBy >> ', typeof req.body.orderBy);
			if (typeof req.body.orderBy === 'string') {

				options.order = generateOrder(req.body.orderByModel, req.body.orderBy);
				console.log('options.order >> ', options.order);
			} else {
				options.order = req.body.orderBy as OrderItem[];
			};
		};

		if (req.body.offset || req.body.limit) {
			options.offset = req.body.offset;
			options.limit = req.body.limit;
		};

		delete req.body.orderBy;
		delete req.body.orderByModel;
	};

	if (!options.order && options.defaultOrder) {
		options.order = options.defaultOrder;
	};

	return options;
};

export const booleanToQueryparam = (val: string): number => {

	if (val) {
		const isTrue = new RegExp([/true/, /1/].map(function (p) { return p.source; }).join('|'));
		return isTrue.test(val.toLowerCase()) ? 1 : 0;
	};

	return 0;
};