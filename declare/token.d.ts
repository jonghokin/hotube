
declare namespace TokenSession {

    export interface IUser {
        name?: string,
        userId?: string,
        role?: ROLE,
    }

    export interface IToken {
        client: string | 'WEB',
        user: IUser
    }
}