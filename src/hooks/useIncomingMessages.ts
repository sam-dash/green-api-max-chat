import {useEffect, useRef, useState} from "react"
import {createGreenApiClient} from "../api/greenApiClient"
import {extractIncomingText} from "../utils/formatters"
import type {GreenApiCredentials, IncomingNotificationBody} from "../types"
import type {IncomingMessagePayload} from "./useChats"

const RETRY_DELAY_MS = 3000

export interface UseIncomingMessagesResult {
    connectionError: string | null
}

export function useIncomingMessages(
    credentials: GreenApiCredentials | null,
    onMessageReceived: (payload: IncomingMessagePayload) => void
): UseIncomingMessagesResult {
    const [connectionError, setConnectionError] = useState<string | null>(null)
    const isActiveRef = useRef(false)

    const onMessageReceivedRef = useRef(onMessageReceived)
    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived
    }, [onMessageReceived])

    useEffect(() => {
        if (!credentials) return undefined

        const client = createGreenApiClient(credentials)
        isActiveRef.current = true

        const handleNotificationBody = (body: IncomingNotificationBody) => {
            if (body.typeWebhook !== "incomingMessageReceived") return

            const chatId = body.senderData?.chatId
            const displayName =
                body.senderData?.chatName ||
                body.senderData?.senderName ||
                chatId
            const text = extractIncomingText(body.messageData)
            if (!chatId || !text) return

            onMessageReceivedRef.current({
                chatId,
                displayName,
                message: {
                    id: body.idMessage,
                    text,
                    fromMe: false,
                    timestamp: body.timestamp,
                    status: "received",
                },
            })
        }

        const pollLoop = async () => {
            while (isActiveRef.current) {
                try {
                    const notification = await client.receiveNotification()
                    if (!isActiveRef.current) break

                    if (notification?.body) {
                        handleNotificationBody(notification.body)
                        await client.deleteNotification(notification.receiptId)
                    }
                    setConnectionError(null)
                } catch {
                    setConnectionError(
                        "Соединение с MAX прервано, повторяем попытку…"
                    )
                    await sleep(RETRY_DELAY_MS)
                }
            }
        }

        pollLoop()

        return () => {
            isActiveRef.current = false
        }
    }, [credentials])

    return {connectionError}
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
