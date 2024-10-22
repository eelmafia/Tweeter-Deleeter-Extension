import { useState, useEffect } from 'react'
import { interceptor, startDeleeter } from './utils'

enum State {
    Loading,
    Ready,
    InProgress,
    Finished,
    Error
}

const stateText: Record<State, string> = {
    [State.Loading]: "Waiting for headers...",
    [State.Ready]: "Ready to deleete",
    [State.InProgress]: "Delete in progress...",
    [State.Finished]: "Delete finished",
    [State.Error]: "Error! Try refreshing the page, or report it on GitHub",
}

type Tokens = {
    authorization: string | null
    transaction_id: string | null
    uuid: string | null
    username: string | null
}

export default function Popup(): JSX.Element {
    const [tokens, setTokens] = useState<Tokens>({
        authorization: null,
        transaction_id: null,
        uuid: null,
        username: null,
    })
    const [deletedTweets, setDeletedTweets] = useState<number>(0)
    const [deletedLikes, setDeletedLikes] = useState<number>(0)
    const [currState, setCurrState] = useState<State>(State.Loading)

    useEffect(() => {
        const messageListener = (message: any) => {
            if (message.type === 'DELEETER_UPDATE') {
                if (message.content.subtype === "USER_POST") {
                    if (message.content.delete_success) {
                        setDeletedTweets((val) => val + 1)
                    }
                } else if (message.content.subtype === "USER_LIKE") {
                    if (message.content.delete_success) {
                        setDeletedLikes((val) => val + 1)
                    }
                } else if (message.content.finished) {
                    setCurrState(State.Finished)
                } else if (message.content.error) {
                    setCurrState(State.Error)
                }
            } else if (message.type === 'DELEETER_TOKENS') {
                setTokens({
                    authorization: message.content.temp_authorisation,
                    transaction_id: message.content.temp_transaction_id,
                    uuid: message.content.temp_cuuid,
                    username: message.content.temp_username,
                })
                setCurrState(State.Ready)
            }
        }

        chrome.runtime.onMessage.addListener(messageListener)

        return () => {
            chrome.runtime.onMessage.removeListener(messageListener)
        }
    }, [])

    useEffect(() => {
        // Check current tab when popup opens
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs: any) {
            const currentUrl = tabs[0].url
            if (currentUrl?.includes('x.com')) {
                const injectInterceptor = async () => {
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
                    if (tab.id) {
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: interceptor,
                            world: "MAIN"
                        }, () => {
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError)
                                return
                            }
                        })
                    }
                }
                injectInterceptor()
            }
        })
    }, []) // Empty dependency array means this effect runs once on mount

    const startDeleting = async () => {
        setCurrState(State.InProgress)
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab.id) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: startDeleeter,
                args: [tokens.authorization!, tokens.transaction_id!, tokens.uuid!, tokens.username!],
                world: "MAIN"
            })
        }
    }
    return (
        <div className='flex flex-col justify-between bg-[#fafaff] text-center px-5 pt-2 pb-7 w-[300px] h-[450px]'>
            <div className='text-black flex flex-col gap-10 my-1'>
                <h1 className='text-[#875BF6] text-3xl font-bold'>Tweeter Deleeter</h1>
                <div className=' border-y-2 pb-4 pt-2 -mx-5 h-[100px] flex flex-col justify-between bg-[#F5F0FF]'>
                    <p className='text-xl'>Account</p>
                    <p className='bg-white rounded-lg py-2 px-2 min-h-10 min-w-44 w-fit mx-auto border-[1px] text-sm'>{tokens.username}</p>
                </div>
            </div>
            <div role="status" className="flex items-center self-center ">
                {currState === State.Loading && <svg className="h-6 w-6 animate-spin stroke-gray-500" viewBox="0 0 256 256">
                    <line x1="128" y1="32" x2="128" y2="64" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
                    <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="24"></line>
                    <line x1="224" y1="128" x2="192" y2="128" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
                    </line>
                    <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="24"></line>
                    <line x1="128" y1="224" x2="128" y2="192" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
                    </line>
                    <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="24"></line>
                    <line x1="32" y1="128" x2="64" y2="128" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
                    <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
                    </line>
                </svg>}
                <span className="text-base font-medium text-gray-500">{stateText[currState]}</span>
            </div>
            <div className='flex flex-col divide-y-[1px] divide-[#9371F0] rounded-md  border-[1px] border-[#9371F0] text-sm'>

                <div className='flex justify-between p-2'>
                    <p>Posts removed</p>
                    <span className='font-bold'>{deletedTweets}</span>
                </div>
                <div className='flex justify-between p-2'>
                    <p>Likes removed</p>
                    <span className='font-bold'>{deletedLikes}</span>
                </div>

            </div>
            <div className='flex flex-col justify-around px-5 gap-5'>
                <button onClick={startDeleting} disabled={currState !== State.Ready && currState !== State.Finished} className="group relative inline-flex h-12 items-center justify-center bg-[#875BF6] px-6 font-medium text-neutral-50 shadow-lg shadow-neutral-500/20 transition active:scale-95 overflow-hidden rounded-md disabled:pointer-events-none disabled:opacity-50">
                    {currState === State.InProgress && <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 h-5 w-5 animate-spin text-white"><path d="M1.90321 7.29677C1.90321 10.341 4.11041 12.4147 6.58893 12.8439C6.87255 12.893 7.06266 13.1627 7.01355 13.4464C6.96444 13.73 6.69471 13.9201 6.41109 13.871C3.49942 13.3668 0.86084 10.9127 0.86084 7.29677C0.860839 5.76009 1.55996 4.55245 2.37639 3.63377C2.96124 2.97568 3.63034 2.44135 4.16846 2.03202L2.53205 2.03202C2.25591 2.03202 2.03205 1.80816 2.03205 1.53202C2.03205 1.25588 2.25591 1.03202 2.53205 1.03202L5.53205 1.03202C5.80819 1.03202 6.03205 1.25588 6.03205 1.53202L6.03205 4.53202C6.03205 4.80816 5.80819 5.03202 5.53205 5.03202C5.25591 5.03202 5.03205 4.80816 5.03205 4.53202L5.03205 2.68645L5.03054 2.68759L5.03045 2.68766L5.03044 2.68767L5.03043 2.68767C4.45896 3.11868 3.76059 3.64538 3.15554 4.3262C2.44102 5.13021 1.90321 6.10154 1.90321 7.29677ZM13.0109 7.70321C13.0109 4.69115 10.8505 2.6296 8.40384 2.17029C8.12093 2.11718 7.93465 1.84479 7.98776 1.56188C8.04087 1.27898 8.31326 1.0927 8.59616 1.14581C11.4704 1.68541 14.0532 4.12605 14.0532 7.70321C14.0532 9.23988 13.3541 10.4475 12.5377 11.3662C11.9528 12.0243 11.2837 12.5586 10.7456 12.968L12.3821 12.968C12.6582 12.968 12.8821 13.1918 12.8821 13.468C12.8821 13.7441 12.6582 13.968 12.3821 13.968L9.38205 13.968C9.10591 13.968 8.88205 13.7441 8.88205 13.468L8.88205 10.468C8.88205 10.1918 9.10591 9.96796 9.38205 9.96796C9.65819 9.96796 9.88205 10.1918 9.88205 10.468L9.88205 12.3135L9.88362 12.3123C10.4551 11.8813 11.1535 11.3546 11.7585 10.6738C12.4731 9.86976 13.0109 8.89844 13.0109 7.70321Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>}
                    <span>{currState !== State.InProgress && "Delete Content"}</span>
                </button>
            </div>
        </div>
    )
}
