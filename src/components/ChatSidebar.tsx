import {getInitial} from "../utils/formatters"
import type {Chat, ChatMessage, MessagesByChatId} from "../types"

export interface ChatSidebarProps {
    chats: Chat[]
    activeChatId: string | null
    messagesByChatId: MessagesByChatId
    onSelectChat(chatId: string): void
    onOpenNewChat(): void
    onLogout(): void
    connectionError: string | null
}

export function ChatSidebar({
    chats,
    activeChatId,
    messagesByChatId,
    onSelectChat,
    onOpenNewChat,
    onLogout,
    connectionError,
}: ChatSidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">MAX</div>
                <div className="sidebar-actions">
                    <button
                        className="new-chat-btn"
                        onClick={onOpenNewChat}
                        title="Новый чат"
                    >
                        +
                    </button>
                    <button
                        className="new-chat-btn logout-btn"
                        onClick={onLogout}
                        title="Выйти из инстанса"
                    >
                        ⏻
                    </button>
                </div>
            </div>

            <div className="chat-list">
                {chats.length === 0 && (
                    <div className="empty-chats">
                        Пока нет чатов.
                        <br />
                        Нажмите «+», чтобы начать
                    </div>
                )}
                {chats.map((chat) => (
                    <ChatListItem
                        key={chat.chatId}
                        chat={chat}
                        isActive={chat.chatId === activeChatId}
                        lastMessage={
                            messagesByChatId[chat.chatId]?.slice(-1)[0]
                        }
                        onSelect={() => onSelectChat(chat.chatId)}
                    />
                ))}
            </div>

            {connectionError && (
                <div className="poll-warning">{connectionError}</div>
            )}
        </aside>
    )
}

interface ChatListItemProps {
    chat: Chat
    isActive: boolean
    lastMessage: ChatMessage | undefined
    onSelect(): void
}

function ChatListItem({
    chat,
    isActive,
    lastMessage,
    onSelect,
}: ChatListItemProps) {
    return (
        <button
            className={`chat-item ${isActive ? "active" : ""}`}
            onClick={onSelect}
        >
            <div className="avatar">{getInitial(chat.name)}</div>
            <div className="chat-item-body">
                <div className="chat-item-name">{chat.name}</div>
                <div className="chat-item-preview">
                    {lastMessage ? lastMessage.text : "Нет сообщений"}
                </div>
            </div>
        </button>
    )
}
