import {useState, type FormEvent} from "react"
import {extractDigits} from "../utils/formatters"

export interface NewChatModalProps {
    onClose(): void
    onCreateChat(phoneDigits: string): Promise<void>
}

export function NewChatModal({onClose, onCreateChat}: NewChatModalProps) {
    const [phoneInput, setPhoneInput] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isChecking, setIsChecking] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setErrorMessage("")

        const digits = extractDigits(phoneInput)
        if (digits.length < 10) {
            setErrorMessage(
                "Введите номер в международном формате, например 79991234567"
            )
            return
        }

        setIsChecking(true)
        try {
            await onCreateChat(digits)
        } catch (err) {
            setErrorMessage(
                err instanceof Error
                    ? err.message
                    : "Не удалось найти получателя"
            )
        } finally {
            setIsChecking(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h2>Новый чат</h2>
                <p className="modal-sub">Номер телефона получателя в MAX</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="tel"
                        placeholder="79991234567"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        autoFocus
                    />
                    {errorMessage && (
                        <div className="login-error">{errorMessage}</div>
                    )}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-ghost"
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                        <button type="submit" disabled={isChecking}>
                            {isChecking ? "Проверяем…" : "Создать чат"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
