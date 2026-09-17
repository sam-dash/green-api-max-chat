export interface GreenApiCredentials {
    idInstance: string
    apiTokenInstance: string
    apiUrl: string
}

export interface GetStateInstanceResponse {
    stateInstance: string
}

export interface CheckAccountResponse {
    exist: boolean
    chatId?: string
}

export interface SendMessageResponse {
    idMessage: string
}

export interface IncomingNotificationSenderData {
    chatId: string
    chatName?: string
    senderName?: string
}

export interface IncomingTextMessageData {
    textMessageData?: {textMessage: string}
    extendedTextMessageData?: {text: string}
}

export interface IncomingNotificationBody {
    typeWebhook: string
    idMessage: string
    timestamp: number
    senderData: IncomingNotificationSenderData
    messageData: IncomingTextMessageData
}

export interface ReceiveNotificationResponse {
    receiptId: number
    body: IncomingNotificationBody
}

export type MessageStatus = "sending" | "sent" | "error" | "received"

export interface ChatMessage {
    id: string
    text: string
    fromMe: boolean
    timestamp: number
    status: MessageStatus
}

export interface Chat {
    chatId: string
    name: string
}

export type MessagesByChatId = Record<string, ChatMessage[]>
