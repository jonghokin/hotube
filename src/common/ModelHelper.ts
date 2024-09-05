import { Request } from 'express';
import { FindAndCountOptions } from 'sequelize';

export default class ModelHelper {

    public static plain(model: any) {

        return model?.toJSON?.();
    };

    public static findRetrieveCountAll(T: any, req: Request, options?: FindAndCountOptions): Promise<{ rows: any[]; count: number }> {

        return new Promise((resolve, reject) => {

            T.findAndCountAll(options)
                .then((result: { rows: any[]; count: number }) => {

                    //데이타는 있으나 해당 페이지의 조회결과가 없을시 마지막 페이지로 재조회
                    if (options?.offset && options?.offset > 0 && result.count > 0 && (!result.rows || result.rows.length <= 0)) {
                        options.limit = options?.limit || 10;
                        options.offset = (Math.ceil(result.count / options.limit) - 1 /*total page*/) * options.limit;

                        req.body.limit = options.limit;
                        req.body.offset = options.offset;

                        resolve(T.findAndCountAll(options));
                    } else {
                        resolve(result);
                    };
                })
                .catch((error: any) => reject(error));
        });
    };
};
