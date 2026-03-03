import "express"
import UserInfo from "../index"



declare global {
    namespace Express {
        interface Request {
            sessionId?: string
            user?: UserInfo
        }
    }
}