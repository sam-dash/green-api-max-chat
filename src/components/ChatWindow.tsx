import {useEffect, useRef, useState, type FormEvent} from "react"
import {getInitial, formatMessageTime} from "../utils/formatters"
import type {Chat, ChatMessage} from "../types"

export interface ChatWindowProps {
    chat: Chat | null
    messages: ChatMessage[]
    onSendMessage(text: string): Promise<void>
}

export function ChatWindow({chat, messages, onSendMessage}: ChatWindowProps) {
    if (!chat) {
        return (
            <div className="chat-pane">
                <div className="chat-placeholder">
                    <div className="placeholder-logo">MAX</div>
                    <p>Выберите чат слева или создайте новый</p>
                </div>
            </div>
        )
    }

    return (
        <main className="chat-pane">
            <ChatHeader chat={chat} />
            <MessageList messages={messages} />
            <MessageComposer onSend={onSendMessage} />
        </main>
    )
}

function ChatHeader({chat}: {chat: Chat}) {
    return (
        <header className="chat-header">
            <div className="avatar">{getInitial(chat.name)}</div>
            <div>
                <div className="chat-header-name">{chat.name}</div>
                <div className="chat-header-sub">chatId: {chat.chatId}</div>
            </div>
        </header>
    )
}

function MessageList({messages}: {messages: ChatMessage[]}) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages])

    if (messages.length === 0) {
        return (
            <div className="messages">
                <div className="empty-messages">Напишите первое сообщение</div>
            </div>
        )
    }

    return (
        <div className="messages">
            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
        </div>
    )
}

function MessageBubble({message}: {message: ChatMessage}) {
    const sentSuffix =
        message.fromMe && message.status === "sending"
            ? " · отправка…"
            : message.fromMe && message.status === "error"
            ? " · ошибка"
            : ""

    return (
        <div className={`bubble-row ${message.fromMe ? "mine" : "theirs"}`}>
            <div className={`bubble ${message.fromMe ? "mine" : "theirs"}`}>
                <div className="bubble-text">{message.text}</div>
                <div className="bubble-meta">
                    {formatMessageTime(message.timestamp)}
                    {sentSuffix}
                </div>
            </div>
        </div>
    )
}

function MessageComposer({onSend}: {onSend(text: string): Promise<void>}) {
    const [draft, setDraft] = useState("")
    const [isSending, setIsSending] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const text = draft.trim()
        if (!text || isSending) return

        setDraft("")
        setIsSending(true)
        try {
            await onSend(text)
        } finally {
            setIsSending(false)
        }
    }

    return (
        <form className="composer" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Написать сообщение"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" disabled={!draft.trim() || isSending}>
                Отправить
            </button>
        </form>
    )
}
