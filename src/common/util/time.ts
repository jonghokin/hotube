import moment, { unitOfTime } from 'moment';
import 'moment-timezone';
import { Op } from 'sequelize';
import { asNumber, format } from './util';

type ISO = string | moment.MomentInput;

export enum DateFormat {
	ISO = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
	SERVER = 'YYYY-MM-DD HH:mm:ss Z'
}

export enum Timezone {
	CLIENT = 'Asia/Seoul'
}

export const timeReset = function(date: Date | moment.Moment | string): moment.Moment{
	
	let m = moment(date);
	m.set({hour: 0,minute: 0,second: 0,millisecond: 0});
	
	return m;
};

export const timeResetEnd = function(date: string | moment.Moment | undefined): moment.Moment {
	
	var m: moment.Moment | undefined;
	if (typeof date === 'string') {
		m = moment(date, DateFormat.SERVER);
	} else if (typeof date === 'undefined') {
		m = moment();
	} else {
		m = date;
	}
	return m!.set({hour: 23,minute: 59,second: 59,millisecond: 999});
};

export const dateAdd = function(date: number, unit: any, period: any, format = 'YYYY-MM-DD HH:mm:ss') {
	return moment(date ? date : new Date()).add(unit, period).format(format);
};

//---------------------------------------------------------------------
// 자바스크립트 Date 에서 추출한 ISO 형식을 moment 로 변환
//---------------------------------------------------------------------
export const isoToMoment = (iso: ISO, timezone?: string): moment.Moment => {

	if (timezone) { return moment(iso, DateFormat.ISO, timezone); }
	else { return moment(iso, DateFormat.ISO, 'Asia/Seoul'); }
}

//---------------------------------------------------------------------
// 자바스크립트 Date 에서 ISO 형식 날짜 리턴
//---------------------------------------------------------------------
export const dateToISO = (date: string): ISO => {

	//if (typeof(date) == 'object') { return date.toISOString();
	//} else { return new Date(date); }

	return new Date(date).toISOString();
}


//---------------------------------------------------------------------
// Date to unixtime(seconds)
//---------------------------------------------------------------------
export const dateToUnixTime = (date: string | Date): number => {
	return moment(date).unix();
}

/**
 * 날짜 검색 조건 변환
 * @param startDate 시작일
 * @param endDate 종료일
 */
export const optionalDates = function(startDate?: string, endDate?: string): any {
	
	if (startDate && endDate) {
		let sdate = timeReset(startDate);
		let edate = timeResetEnd(endDate);
		return { [Op.between]: [sdate, edate] };
	} else if (startDate) {
		let sdate = timeReset(startDate);
		return { [Op.gte]: sdate };
	} else if (endDate) {
		let edate = timeResetEnd(endDate);
		return { [Op.lte]: edate };
	}

	return;
};

export const optionalDatesToString = function(startDate?: string, endDate?: string): string | undefined {
	
	if (startDate && endDate) {
		let sdate = timeReset(startDate);
		let edate = timeResetEnd(endDate);
		return `BETWEEN '${sdate.format('YYYY-MM-DD HH:mm:ss')}' AND '${edate.format('YYYY-MM-DD HH:mm:ss')}'`;
	} else if (startDate) {
		let sdate = timeReset(startDate);
		return `>= '${sdate.format('YYYY-MM-DD HH:mm:ss')}'`;
	} else if (endDate) {
		let edate = timeResetEnd(endDate);
		return `<= '${edate.format('YYYY-MM-DD HH:mm:ss')}'`;
	}

	return;
};

/**
 * 날짜 검색 조건 변환
 * @param startDate 시작일
 * @param endDate 종료일
 */
export const betweenDates = function(startDate: string, endDate: string): moment.Moment[] | undefined {
	
	if (startDate || endDate) {
        let sdate = timeReset(startDate || new Date());
		let edate = timeResetEnd(endDate || sdate.clone());
		
		if(sdate.isValid() && edate.isValid()){
			return [sdate, edate];
		}
	}
	
	return;
};

/**
 * 날짜검색 범위가 오늘 이후 일자일 경우 오늘날짜로 초기화
 * @param dates 
 * @returns 
 */
const adjustDates = (dates: moment.Moment[]): moment.Moment[] | undefined => {

	if (!dates) {
		return;
	}

	const today = moment();
	for (let i = 0; i < dates.length; i++){
		if (dates[i].isAfter(today)) {
			if (i == 0) {
				dates[i] = timeReset(today);
			} else {
				dates[i] = timeResetEnd(today);
			}
		}
	}

	return dates;
};

/**
 * 시간이 경과 되었는지 여부
 * @param o1 
 * @param o2 
 * @returns 
 */
export const isAfter = (o1: Date | string, o2: Date | string, granularity?: unitOfTime.StartOf): boolean => {

	const t1 = moment(o1);
	const t2 = moment(o2);

	return t1.isAfter(t2, granularity);
}

/**
 * 이전 시간이지 여부
 * @param o1 
 * @param o2 
 * @returns 
 */
export const isBefore = (o1: Date | string, o2: Date | string, granularity?: unitOfTime.StartOf): boolean => {

	const t1 = moment(o1);
	const t2 = moment(o2);

	return t1.isBefore(t2, granularity);
}

/**
 * 시간이 동일한지 여부(일자/주간/월간 등의 옵션이 있음)
 * @param o1 
 * @param o2 
 * @param option 
 * @returns 
 */
export const isSame = (o1: Date | string, o2: Date | string, granularity?: unitOfTime.StartOf): boolean => {

	const t1 = moment(o1);
	const t2 = moment(o2);

	return t1.isSame(t2, granularity);
}


/**
 * 날짜 검색 조건 변환, 없을시 오늘일자 반환
 * @param startDate 시작일
 * @param endDate 종료일
 */
export const betweenDefaultDates = function(startDate: string, endDate: string, options?: any): moment.Moment[] {
	
	let _options = Object.assign({
			day: 0,
			week: 0,
			month: 0,
			year: 0
		}, options);

	let dates: moment.Moment[] | undefined = betweenDates(startDate, endDate);
	if (!dates) {
		let sdate = timeReset(new Date());
		let edate = timeResetEnd(sdate.clone());
		dates = [sdate, edate];
		
		if (_options.day !== 0) {
			dates[0].add(_options.day, 'day');
		}
	
		if (_options.week !== 0) {
			dates[0].add(_options.week, 'week');
		}
	
		if (_options.month !== 0) {
			dates[0].add(_options.month, 'month');
		}
	
		if (_options.day !== 0) {
			dates[0].add(_options.year, 'year');
		}
	}

	return dates;
};

export const startOfWeek = (date?: Date | string, format: string = 'YYYY-MM-DD'): string => {
	return moment(date).startOf("week").format(format);
};

export const endOfWeek = (date?: Date | string, format: string = 'YYYY-MM-DD'): string => {
	return moment(date).endOf("week").format(format);
};