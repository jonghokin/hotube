
import { FindAndCountOptions } from 'sequelize'

declare module 'sequelize' {
    interface FindAndCountOptions {
        defaultOrder?: Order
    }

    interface UpdateOptions {
        excludes?: string[];
    }
}
