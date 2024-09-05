import IUser from "../knockCommon/models/user/iUser";

declare namespace Express {
    
    export interface Request {
        polyglot?: any
        token: TokenSession.IToken // 토큰에 저장된 정보를 객체화 하여 저장
    }

    export interface Response {
        locals: LocalsObj & Locals & { payload: IUser };
    }
}