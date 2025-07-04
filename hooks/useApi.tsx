import useSWR, { SWRConfiguration } from "swr"

export const fetcher = async (url: string) => {
  const res = await fetch(url)

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})) // Gracefully handle if error body isn't JSON
    const error = new Error(
      errorData.error || "An error occurred while fetching the data."
    )

    // @ts-ignore
    error.status = res.status
    throw error
  }

  return res.json()
}

export function useApiGet<T>(key: string | null, options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<T>(key, fetcher, options)

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}
