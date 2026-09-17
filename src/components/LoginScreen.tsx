import {useState, type FormEvent} from "react"
import type {LoginParams} from "../hooks/useAuth"

export interface LoginScreenProps {
    onLogin(params: LoginParams): Promise<void>
    onDemoLogin(): void
}

export function LoginScreen({onLogin, onDemoLogin}: LoginScreenProps) {
    const [idInstance, setIdInstance] = useState("")
    const [apiTokenInstance, setApiTokenInstance] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setErrorMessage("")

        if (!idInstance.trim() || !apiTokenInstance.trim()) {
            setErrorMessage("Заполните оба поля")
            return
        }

        setIsSubmitting(true)
        try {
            await onLogin({
                idInstance: idInstance.trim(),
                apiTokenInstance: apiTokenInstance.trim(),
            })
        } catch (err) {
            setErrorMessage(
                err instanceof Error ? err.message : "Не удалось подключиться"
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="login-screen">
            <div className="login-card">
                <div className="login-logo">MAX</div>
                <h1>Вход в GREEN-API</h1>
                <p className="login-sub">
                    Введите учётные данные инстанса из личного кабинета
                    GREEN-API, чтобы отправлять и получать сообщения в MAX
                </p>
                <form onSubmit={handleSubmit}>
                    <label>
                        idInstance
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="1234567890"
                            value={idInstance}
                            onChange={(e) => setIdInstance(e.target.value)}
                            autoComplete="off"
                        />
                    </label>
                    <label>
                        apiTokenInstance
                        <input
                            type="password"
                            placeholder="d75b3a66374942c5b3c019c698abc2067e151558acbd451234"
                            value={apiTokenInstance}
                            onChange={(e) =>
                                setApiTokenInstance(e.target.value)
                            }
                            autoComplete="off"
                        />
                    </label>
                    {errorMessage && (
                        <div className="login-error">{errorMessage}</div>
                    )}
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Подключаемся…" : "Войти"}
                    </button>
                </form>
                <div className="login-divider">или</div>
                <button
                    type="button"
                    className="login-demo-btn"
                    onClick={onDemoLogin}
                >
                    Посмотреть демо без регистрации
                </button>
            </div>
        </div>
    )
}
