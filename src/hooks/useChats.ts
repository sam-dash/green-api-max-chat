import {useState, useCallback, useMemo} from "react"
import {createGreenApiClient} from "../api/greenApiClient"
import type {
    GreenApiCredentials,
    Chat,
    ChatMessage,
    MessagesByChatId,
} from "../types"

export interface IncomingMessagePayload {
    chatId: string
    displayName: string
    message: ChatMessage
}

export interface UseChatsResult {
    chats: Chat[]
    activeChatId: string | null
    setActiveChatId(chatId: string | null): void
    messagesByChatId: MessagesByChatId
    createChatByPhoneNumber(phoneDigits: string): Promise<string>
    sendTextMessage(chatId: string, text: string): Promise<void>
    receiveIncomingMessage(payload: IncomingMessagePayload): void
    resetAll(): void
}

export function useChats(
    credentials: GreenApiCredentials | null
): UseChatsResult {
    const [chats, setChats] = useState<Chat[]>([])
    const [messagesByChatId, setMessagesByChatId] = useState<MessagesByChatId>(
        {}
    )
    const [activeChatId, setActiveChatId] = useState<string | null>(null)

    const client = useMemo(
        () => (credentials ? createGreenApiClient(credentials) : null),
        [credentials]
    )

    const requireClient = useCallback(() => {
        if (!client) {
            throw new Error(
                "Нет активной сессии GREEN-API — сначала выполните вход"
            )
        }
        return client
    }, [client])

    const appendMessage = useCallback(
        (chatId: string, message: ChatMessage) => {
            setMessagesByChatId((prev) => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []), message],
            }))
        },
        []
    )

    const updateMessage = useCallback(
        (chatId: string, messageId: string, patch: Partial<ChatMessage>) => {
            setMessagesByChatId((prev) => ({
                ...prev,
                [chatId]: (prev[chatId] || []).map((m) =>
                    m.id === messageId ? {...m, ...patch} : m
                ),
            }))
        },
        []
    )

    const ensureChatExists = useCallback(
        (chatId: string, displayName: string) => {
            setChats((prev) => {
                if (prev.some((c) => c.chatId === chatId)) return prev
                return [...prev, {chatId, name: displayName}]
            })
        },
        []
    )

    const createChatByPhoneNumber = useCallback(
        async (phoneDigits: string) => {
            const result = await requireClient().checkAccount(phoneDigits)
            if (!result?.exist) {
                throw new Error("Этот номер не зарегистрирован в MAX")
            }
            const chatId = result.chatId || phoneDigits
            ensureChatExists(chatId, phoneDigits)
            setActiveChatId(chatId)
            return chatId
        },
        [requireClient, ensureChatExists]
    )

    const sendTextMessage = useCallback(
        async (chatId: string, text: string) => {
            const tempId = `local-${Date.now()}`
            appendMessage(chatId, {
                id: tempId,
                text,
                fromMe: true,
                timestamp: Math.floor(Date.now() / 1000),
                status: "sending",
            })

            try {
                const result = await requireClient().sendMessage(chatId, text)
                if (!result) {
                    throw new Error(
                        "GREEN-API вернул пустой ответ на sendMessage"
                    )
                }
                updateMessage(chatId, tempId, {
                    id: result.idMessage,
                    status: "sent",
                })
            } catch {
                updateMessage(chatId, tempId, {status: "error"})
            }
        },
        [requireClient, appendMessage, updateMessage]
    )

    const receiveIncomingMessage = useCallback(
        ({chatId, displayName, message}: IncomingMessagePayload) => {
            ensureChatExists(chatId, displayName)
            appendMessage(chatId, message)
        },
        [ensureChatExists, appendMessage]
    )

    const resetAll = useCallback(() => {
        setChats([])
        setMessagesByChatId({})
        setActiveChatId(null)
    }, [])

    return {
        chats,
        activeChatId,
        setActiveChatId,
        messagesByChatId,
        createChatByPhoneNumber,
        sendTextMessage,
        receiveIncomingMessage,
        resetAll,
    }
}
