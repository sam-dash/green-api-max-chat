import {useState, useEffect, useCallback} from "react"
import {createGreenApiClient} from "../api/greenApiClient"
import {DEMO_API_URL} from "../api/mockGreenApiClient"
import type {GreenApiCredentials} from "../types"

const STORAGE_KEY = "max_green_api_credentials"
const DEFAULT_API_URL = "https://api.green-api.com"

function readStoredCredentials(): GreenApiCredentials | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        return raw ? (JSON.parse(raw) as GreenApiCredentials) : null
    } catch {
        return null
    }
}

export interface LoginParams {
    idInstance: string
    apiTokenInstance: string
}

export interface UseAuthResult {
    credentials: GreenApiCredentials | null
    isRestoring: boolean
    login(params: LoginParams): Promise<void>
    loginDemo(): void
    logout(): void
}

export function useAuth(): UseAuthResult {
    const [credentials, setCredentials] = useState<GreenApiCredentials | null>(
        null
    )
    const [isRestoring, setIsRestoring] = useState(true)

    useEffect(() => {
        setCredentials(readStoredCredentials())
        setIsRestoring(false)
    }, [])

    const login = useCallback(
        async ({idInstance, apiTokenInstance}: LoginParams) => {
            const candidate: GreenApiCredentials = {
                idInstance,
                apiTokenInstance,
                apiUrl: DEFAULT_API_URL,
            }
            const client = createGreenApiClient(candidate)

            const state = await client.getStateInstance()

            if (state?.stateInstance && state.stateInstance !== "authorized") {
                throw new Error(
                    `Инстанс не авторизован (статус: ${state.stateInstance}). Отсканируйте QR-код в личном кабинете GREEN-API`
                )
            }

            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate))
            setCredentials(candidate)
        },
        []
    )

    const loginDemo = useCallback(() => {
        setCredentials({
            idInstance: "demo",
            apiTokenInstance: "demo",
            apiUrl: DEMO_API_URL,
        })
    }, [])

    const logout = useCallback(() => {
        window.localStorage.removeItem(STORAGE_KEY)
        setCredentials(null)
    }, [])

    return {credentials, isRestoring, login, loginDemo, logout}
}
