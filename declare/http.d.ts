import { IncomingHttpHeaders } from 'http'

declare module 'http' {
    interface IncomingHttpHeaders {
        'token'?: string
        'refresh'?: string
    }
}