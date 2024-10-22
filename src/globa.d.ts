interface Navigator {
    userAgentData?: {
        getHighEntropyValues(hints: string[]): Promise<{
            brands: Array<{brand: string, version: string}>,
            mobile: boolean,
            platform: string
        }>
    }
}