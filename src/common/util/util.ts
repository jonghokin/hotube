import express from 'express'
import _ from 'lodash'
import moment from 'moment'
import util from 'util'
import { v4 } from 'uuid'

/*
 * trim leading and trailing
 */
export const trim = (val: string): string => {

	if (val && typeof val === 'string') {
		return val.replace(/^\s+|\s+$/g, '');
	}

	return val;
}

/*
 * remove all space
 */
export const whitespaceTrim = (val?: string): string => {
	return !val ? '' : val.replace(/\s+/g, '');
}

/*
 * remove CR/LF
 */
export const trimLf = (val: string): string => {
	return !val ? '' : val.replace(/(\r\n|\n|\r)/g, '').replace(/^\s+|\s+$/g, '');
}

/**
 * lodash 객체 복제(깊은 복사)
 */
export const clone = function (obj: any) {
	return _.cloneDeep(obj);
};

export const merge = function (obj: any, obj2: any) {
	return _.merge(obj, obj2);
};

export const union = function (obj: any, obj2: any): any {
	return _.union(obj, obj2);
};

/**
 * @see https://millermedeiros.github.io/mdoc/examples/node_api/doc/util.html#util.format
 */
export const format = util.format;
export const extend = (ext: any, src: any): any => {
	return Object.assign(ext, src);
}

export const hasOwnProperty = <X extends {}, Y extends PropertyKey>(obj: X, prop: Y): boolean => {
	return obj.hasOwnProperty(prop);
}

/**
 * array 를 n 분하여 배열 리턴
 * @param val any[array[]]
 */
export const arrayDivision = function <T>(arr: T[], n: number): any[T] {
	var len = arr.length;
	var cnt = Math.floor(len / n) + (Math.floor(len % n) > 0 ? 1 : 0);
	var tmp = [];

	for (var i = 0; i < cnt; i++) {
		tmp.push(arr.splice(0, n));
	}

	return tmp;
};

/**
 * property 선언 여부
 * 단순 empty 값인지 체크 위함.
 * @param val 
 */
export const isUndefined = function (val?: any): boolean {
	return val === undefined;
};

export const isEmpty = function (val?: any): boolean {

	if (!val) { return true; }
	if (Array.isArray(val) && val.length <= 0) { return true; }
	if (!trim(val)) { return true; }

	return false;
};

/**
 * 5자리 난수 생성
 * 인증번호
 */
export const pin = function (digit: number = 5) {
	const pow = Math.pow(10, digit - 1);
	return Math.floor((Math.random() * (9 * pow)) + (1 * pow));
};

export const uuid = (number?: boolean) => {

	if (number) {
		//12 + '-' + 3 + '-' + 3
		//202010211100-246-339
		return (moment().format('YYYYMMDDHHmm') + '-' + pin(3) + '-' + pin(3));
	}

	return v4();
}

export const randomDatetime = function () {
	return moment(new Date()).format('YYYYMMDDHHmmssSSS') + (Math.floor(Math.random() * 90000) + 10000);
};

export const validIdentifier = (id: string): void => {

	let allow = /^[_-a-zA-Z0-9]*$/;
	if (!allow.test(id)) {
		throw new Error('영문/숫자, \'-\', \'_\'만 허용됩니다.');
	}
}

/**
 * 포맷에 맞는 uuid 생성
 *  : 컬럼 size에 맞게 설정, 20자리로 제한됨.
 * EQ-20201021-1000
 * @param format 
 * @param digit 
 */
export const identifier = function (prefix: string, options?: { [key: string]: any }) {

	const op = extend({
		format: 'YYYYMMDD',
		digit: 4,
		sequence: '',
		max: 7
	}, options);

	op.digit = Math.min(op.digit, op.max);

	try {
		if (op.sequence && typeof op.sequence === 'string' && op.sequence.length > op.max) {
			op.sequence = op.sequence.substring(op.sequence.length - op.max, op.sequence.length);
		}
	} catch (error) { }

	return prefix + '-' + moment().format(op.format) + '-' + (op.sequence ? op.sequence : pin(op.digit));
};

/*
 * 기존의 No로부터 다음 순차 생성
 * Order, Estimate 에서 사용 
 * @param identifier 
 * @param seperate 
 * @param padding 
 */
export const sequence = function (identifier: string, seperate: string = '-', padding: number = 4) {

	const seq = identifier.split(seperate).pop();
	if (!seq) {
		return '1'.padStart(padding, '0'); // return '0001'
	}

	const asSeq = asNumber(seq);
	return `${asSeq + 1}`.padStart(padding, '0');
};


// export const o2s = (obj: any): string => {

// 	var arr = [];
// 	for (var key in obj) {
// 		arr.push(obj[key]);
// 	}

// 	return arr.join();
// };

/**
 * PATH(1), // http://www.i2l.com:8080/a/b/c
 * PROTOCOL(2), // http
 * FULL_DOMAIN(3), // www.i2l.com
 * HIPER(4), // www
 * DOMAIN(5), // i2l.com
 * FULL_PORT(6), // :8080
 * PORT(7), // 8080
 * DIR(8), // /a/b/c
 * LAST_DIR(9), // /c
 * FILE_NAME(10), // test.html
 * TEMP10(11), QUERY(12), // a=1&b=2
 * TEMP12(13), ANCHOR(14); // sharp
 */
export const extractUrl = function (url: string, part: number): string | null {

	const HTTP_URL_REGX = '^((http|https?):\\/\\/((.*?\\.)?([^:\\/\\s]+))(:([^\\/]*))?((\\/[^\\s/\\/]+)*))?\\/([^#\\s\\?]*)(\\?([^#\\s]*))?(#(\\w*))?$';
	const groups: any = url.match(HTTP_URL_REGX);
	//console.log('match : ', group[1]);
	return groups[part];
};

export const extractFileName = function (val?: string): string {

	if (!val) {
		return '';
	}

	var split = val.split('/');
	return (!split || split.length < 1) ? '' : split[split.length - 1];
};

export const extractFileNameWithoutExt = function (val?: string): string {

	let fileName = extractFileName(val);
	if (fileName) {
		var split = fileName.split(".");
		fileName = (!split || split.length < 1) ? fileName : split[0];
	}

	return fileName;
};

export const extractFileExtension = function (val?: string): string {

	let fileName = extractFileName(val);
	let ext = '';
	if (fileName) {
		var split = fileName.split(".");
		ext = (!split || split.length < 1) ? '' : split[split.length - 1];
	}

	return ext;
};

export const replaceExt = function (val?: string, ext?: string): string {

	if (!val) {
		return '';
	}

	let fileName = extractFileNameWithoutExt(val);
	return fileName + '.' + ext;
};

export const removeQuerystring = function (val: string | undefined, seperate: string): string {

	if (!val) {
		return '';
	}

	const index = val.lastIndexOf(seperate);
	if (index !== -1) {
		return val.substring(0, index);
	}

	return val;
};

export const generatePath = function (val: any): string {

	if (!val) {
		return '';
	}

	return val.join('/');
};

/**
 * 음수 -> 양수 변환
 * @param val 
 * @returns 
 */
export const absNumber = function (val: any): number {
	return Math.abs(asNumber(val));
}

// 값이 undefined 이거나 null 일경우 빈값 반환
export const asEmpty = function (val: string): string {

	if (!val) {
		return '';
	}

	return val;
}

export const asNumber = function (val: any): number {

	let n = 0;

	try {

		if (!val) {
			return 0;
		}

		n = Number(val);
		if (isNaN(n)) {
			console.log('isNan : ', val);
			return 0;
		}

	} catch (error) {
		n = 0;
	}

	return n;
};

export const asList = function (keys: Array<string>, without: Array<number>): Array<number> | any {

	if (!keys) {
		return;
	}

	let idxs: Array<number> = [];
	for (var k of keys) {

		let idx = parseInt(k);
		if (without && without.includes(idx)) {
			continue;
		}
		idxs.push(idx);
	}

	return idxs;
};

export const dateAdd = (date: Date, unit: any, period: number, format = 'YYYY-MM-DD HH:mm:ss'): string => {
	return moment(date ? date : new Date()).add(unit, period).format(format);
};

/**
 * 문자열에서 숫자 추출
 * @param str 
 */
export const extractNumber = (str: string): number => {

	const numStr = str.replace(/^\D+/g, '');
	// console.log('extractNumber %s', numStr);
	return asNumber(numStr);
}

/**
 * Queue 데이타를 object<key, value>로 convert
 * @param map 
 */
export const fromEntries = (map?: Map<string, any>): Object[] | undefined => {

	if (!map) {
		return;
	}

	const object: any[] = [];
	map.forEach(function (value, key) {
		// console.log('fromEntries :', value);
		object.push(value);
	});

	return object;
}

export const isPrivateAddress = (ip?: string): boolean => {

	const privatesBand = ['10', '192.168'] // 내부망 list
	const privates = ['1', '::1', '127.0.0.1', 'localhost'] // 내부망 list

	if (!ip) {
		return false;
	}

	let ips = ip.split('.');
	if (ips?.length === 4) {
		for (const e of privatesBand) {
			if (e === ips[0] || e === (`${ips[0]}.${ips[1]}`)) {
				return true;
			}
		}

		if (ips[0] === '172') {
			const octet = parseInt(ips[1]);
			if (octet >= 16 && octet <= 31) {
				return true;
			}
		}
	}

	for (const e of privates) {
		if (ip === e) {
			return true;
		}
	}

	return false;
};

export const ipAddress = (req?: express.Request): string | undefined => {

	if (req) {

		// console.log('###### remote headers ip : ', req.headers['x-forwarded-for']);
		// console.log('###### remote connection ip : ', req.connection.remoteAddress);
		// console.log('###### remote socker ip : ', req.socket.remoteAddress);
		// console.log('###### remote ip : ', req.ip);
		// console.log('###### remote ips : ', req.ips);

		let ip: string | string[] | undefined = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
		if (ip) {
			if (Array.isArray(ip)) {
				ip = ip.pop();
			}

			return ip?.split(':').pop();
		}
	}

	return;
}

export const hexToAscii = (hex: string) => {
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substring(n, n + 2), 16));
	}
	return str;
}

/**
 * javascript가 가진 실수 게산 버그
 * 0.2 + 0.28 = 0.48000000000000004 와 같은 값이 나온다.
 * @param val 
 */
export const adjustFloatingPoint = (val: number | string) => {

	return Math.round(asNumber(val) * 1e12) / 1e12;

}