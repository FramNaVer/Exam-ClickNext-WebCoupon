export interface ActivityLog {
    id: number
    level: 'info' | 'warn' | 'error'
    action: string
    actor_id: number | null
    actor_name: string | null
    target_type: string | null
    target_id: number | null
    message: string
    metadata: Record<string, any> | null
    ip_address: string | null
    created_at: string
}

export interface LogFilters {
    level?: string
    action?: string
    startDate?: string
    endDate?: string
}

export const useAdminLogs = () => {
    const { apiFetch } = useApi()

    const logs = ref<ActivityLog[]>([])
    const loading = ref(false)
    const error = ref('')
    const total = ref(0)
    const totalPages = ref(0)
    const currentPage = ref(1)
    const filters = reactive<LogFilters>({
        level: '',
        action: '',
        startDate: '',
        endDate: '',
    })

    async function fetchLogs(page = 1) {
        loading.value = true
        error.value = ''
        currentPage.value = page
        try {
            const params = new URLSearchParams()
            params.set('page', String(page))
            params.set('limit', '20')
            if (filters.level)     params.set('level', filters.level)
            if (filters.action)    params.set('action', filters.action)
            if (filters.startDate) params.set('startDate', filters.startDate)
            if (filters.endDate)   params.set('endDate', filters.endDate)

            const data = await apiFetch<{
                success: boolean
                logs: ActivityLog[]
                total: number
                totalPages: number
                page: number
            }>(`/api/admin/logs?${params.toString()}`)

            logs.value = data.logs
            total.value = data.total
            totalPages.value = data.totalPages
        } catch (e: any) {
            error.value = e?.data?.message || 'Failed to load logs'
        } finally {
            loading.value = false
        }
    }

    function resetFilters() {
        filters.level = ''
        filters.action = ''
        filters.startDate = ''
        filters.endDate = ''
    }

    return {
        logs, loading, error,
        total, totalPages, currentPage,
        filters, fetchLogs, resetFilters,
    }
}
