import type {GreenApiClient} from "./greenApiClient"
import type {
    GetStateInstanceResponse,
    CheckAccountResponse,
    SendMessageResponse,
    ReceiveNotificationResponse,
    IncomingNotificationBody,
} from "../types"

export const DEMO_API_URL = "mock://demo"

const AUTO_REPLIES = [
    "Привет! Это демо-ответ 👋",
    "Понял тебя, спасибо за сообщение.",
    "Демо-режим работает без реального аккаунта GREEN API.",
    "А как тебе интерфейс?",
    "Всё летает — можно проверять дальше.",
]

let receiptCounter = 1
let messageCounter = 1
const pendingNotifications: ReceiveNotificationResponse[] = []

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function pushIncomingMessage(chatId: string, text: string): void {
    const body: IncomingNotificationBody = {
        typeWebhook: "incomingMessageReceived",
        idMessage: `demo-in-${messageCounter++}`,
        timestamp: Math.floor(Date.now() / 1000),
        senderData: {
            chatId,
            chatName: "Демо-собеседник",
        },
        messageData: {
            textMessageData: {textMessage: text},
        },
    }
    pendingNotifications.push({receiptId: receiptCounter++, body})
}

export function createMockGreenApiClient(): GreenApiClient {
    return {
        async getStateInstance(): Promise<GetStateInstanceResponse | null> {
            await sleep(300)
            return {stateInstance: "authorized"}
        },

        async checkAccount(
            phoneNumber: string
        ): Promise<CheckAccountResponse | null> {
            await sleep(300)
            setTimeout(
                () =>
                    pushIncomingMessage(
                        phoneNumber,
                        "Привет! Пиши, я на связи 🙂"
                    ),
                1200
            )
            return {exist: true, chatId: phoneNumber}
        },

        async sendMessage(
            chatId: string,
            message: string
        ): Promise<SendMessageResponse | null> {
            await sleep(300)
            const idMessage = `demo-out-${messageCounter++}`
            const reply = message.trim().endsWith("?")
                ? "Хороший вопрос! В демо-режиме отвечаю случайно 🙂"
                : AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
            setTimeout(() => pushIncomingMessage(chatId, reply), 1500)
            return {idMessage}
        },

        async receiveNotification(
            timeoutSeconds = 5
        ): Promise<ReceiveNotificationResponse | null> {
            const deadline = Date.now() + timeoutSeconds * 1000
            while (Date.now() < deadline) {
                const next = pendingNotifications.shift()
                if (next) return next
                await sleep(300)
            }
            return null
        },

        async deleteNotification(): Promise<null> {
            return null
        },
    }
}
