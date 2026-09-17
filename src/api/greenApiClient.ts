import type {
    GreenApiCredentials,
    GetStateInstanceResponse,
    CheckAccountResponse,
    SendMessageResponse,
    ReceiveNotificationResponse,
} from "../types"
import {DEMO_API_URL, createMockGreenApiClient} from "./mockGreenApiClient"

export class GreenApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = "GreenApiError"
        this.status = status
    }
}

function toHumanMessage(status: number, rawBody: string): string {
    if (status === 401 || status === 403) {
        return "Неверные idInstance или apiTokenInstance, либо инстанс заблокирован"
    }
    if (status === 400) {
        return "Некорректный запрос к GREEN API — проверьте введённые данные"
    }
    if (rawBody.includes("quotaExceeded") || status === 466) {
        return "Превышен лимит запросов на тарифе. Попробуйте позже"
    }
    if (status >= 500) {
        return "GREEN API временно недоступен, попробуйте ещё раз"
    }
    return "Не удалось выполнить запрос к GREEN API"
}

function buildInstanceUrl(
    {apiUrl, idInstance, apiTokenInstance}: GreenApiCredentials,
    method: string,
    extraPath = ""
): string {
    const base = apiUrl.replace(/\/$/, "")
    return `${base}/waInstance${idInstance}/${method}/${apiTokenInstance}${extraPath}`
}

async function parseJsonOrThrow<T>(response: Response): Promise<T | null> {
    if (!response.ok) {
        const rawBody = await response.text().catch(() => "")
        throw new GreenApiError(
            toHumanMessage(response.status, rawBody),
            response.status
        )
    }
    const text = await response.text()
    return text ? (JSON.parse(text) as T) : null
}

export interface GreenApiClient {
    getStateInstance(): Promise<GetStateInstanceResponse | null>
    checkAccount(phoneNumber: string): Promise<CheckAccountResponse | null>
    sendMessage(
        chatId: string,
        message: string
    ): Promise<SendMessageResponse | null>
    receiveNotification(
        timeoutSeconds?: number
    ): Promise<ReceiveNotificationResponse | null>
    deleteNotification(receiptId: number): Promise<null>
}

export function createGreenApiClient(
    credentials: GreenApiCredentials
): GreenApiClient {
    if (credentials.apiUrl === DEMO_API_URL) {
        return createMockGreenApiClient()
    }

    return {
        async getStateInstance() {
            const url = buildInstanceUrl(credentials, "getStateInstance")
            const res = await fetch(url)
            return parseJsonOrThrow<GetStateInstanceResponse>(res)
        },

        async checkAccount(phoneNumber: string) {
            const url = buildInstanceUrl(credentials, "checkAccount")
            const res = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({phoneNumber: Number(phoneNumber)}),
            })
            return parseJsonOrThrow<CheckAccountResponse>(res)
        },

        async sendMessage(chatId: string, message: string) {
            const url = buildInstanceUrl(credentials, "sendMessage")
            const res = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({chatId, message}),
            })
            return parseJsonOrThrow<SendMessageResponse>(res)
        },

        async receiveNotification(timeoutSeconds = 5) {
            const url = buildInstanceUrl(
                credentials,
                "receiveNotification",
                `?receiveTimeout=${timeoutSeconds}`
            )
            const res = await fetch(url)
            return parseJsonOrThrow<ReceiveNotificationResponse>(res)
        },

        async deleteNotification(receiptId: number) {
            const url = buildInstanceUrl(
                credentials,
                "deleteNotification",
                `/${receiptId}`
            )
            const res = await fetch(url, {method: "DELETE"})
            return parseJsonOrThrow<null>(res)
        },
    }
}
