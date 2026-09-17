import type {IncomingTextMessageData} from "../types"

export function extractDigits(rawInput: string): string {
    return rawInput.replace(/\D/g, "")
}

export function getInitial(displayName: string | undefined): string {
    if (!displayName) return "?"
    return displayName.trim().slice(0, 1).toUpperCase()
}

export function formatMessageTime(unixTimestampSeconds: number): string {
    const date = new Date(unixTimestampSeconds * 1000)
    return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    })
}

export function extractIncomingText(
    messageData: IncomingTextMessageData
): string | null {
    return (
        messageData?.textMessageData?.textMessage ??
        messageData?.extendedTextMessageData?.text ??
        null
    )
}
