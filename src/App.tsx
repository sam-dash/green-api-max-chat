import {useState} from "react"
import {useAuth} from "./hooks/useAuth"
import {useChats} from "./hooks/useChats"
import {useIncomingMessages} from "./hooks/useIncomingMessages"
import {LoginScreen} from "./components/LoginScreen"
import {NewChatModal} from "./components/NewChatModal"
import {ChatSidebar} from "./components/ChatSidebar"
import {ChatWindow} from "./components/ChatWindow"
import {SessionRestoringScreen} from "./components/SessionRestoringScreen"

export default function App() {
    const {credentials, isRestoring, login, loginDemo, logout} = useAuth()
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
    const {
        chats,
        activeChatId,
        setActiveChatId,
        messagesByChatId,
        createChatByPhoneNumber,
        sendTextMessage,
        receiveIncomingMessage,
        resetAll,
    } = useChats(credentials)
    const {connectionError} = useIncomingMessages(
        credentials,
        receiveIncomingMessage
    )

    const handleLogout = () => {
        logout()
        resetAll()
    }

    if (isRestoring) {
        return <SessionRestoringScreen />
    }

    if (!credentials) {
        return <LoginScreen onLogin={login} onDemoLogin={loginDemo} />
    }

    const activeChat = chats.find((c) => c.chatId === activeChatId) || null
    const activeMessages = activeChatId
        ? messagesByChatId[activeChatId] || []
        : []

    return (
        <div className="app">
            <ChatSidebar
                chats={chats}
                activeChatId={activeChatId}
                messagesByChatId={messagesByChatId}
                onSelectChat={setActiveChatId}
                onOpenNewChat={() => setIsNewChatModalOpen(true)}
                onLogout={handleLogout}
                connectionError={connectionError}
            />

            <ChatWindow
                chat={activeChat}
                messages={activeMessages}
                onSendMessage={async (text) => {
                    if (!activeChatId) return
                    await sendTextMessage(activeChatId, text)
                }}
            />

            {isNewChatModalOpen && (
                <NewChatModal
                    onClose={() => setIsNewChatModalOpen(false)}
                    onCreateChat={async (phoneDigits) => {
                        await createChatByPhoneNumber(phoneDigits)
                        setIsNewChatModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}
