import { Spinner } from './Spinner'
import React, { useState, memo, useRef } from 'react'
import sanitizeHtml from 'sanitize-html'
import debounce from 'debounce'

type AccountDetails = {
  /**
   * // IMPORTANT
   * Mastodon uses int64 so will overflow Javascript's number type
   * Pleroma uses 128-bit ids. However just like Mastodon's ids they are lexically sortable strings
   */
  id: string
  acct: string
  followed_by: Set<string> // list of handles
  followers_count: number
  discoverable: boolean
  display_name: string
  note: string
  avatar_static: string
}

async function usernameToId(
  handle: string
): Promise<{ id: string; domain: string }> {
  const match = handle.match(/^(.+)@(.+)$/)
  if (!match || match.length < 2) {
    throw new Error(`Incorrect handle: ${handle}`)
  }
  const domain = match[2]
  const username = match[1]
  let response = await fetch(
    `https://${domain}/api/v1/accounts/lookup?acct=${username}`
  )
  if (response.status !== 200) {
    throw new Error('HTTP request failed')
  }
  const { id } = await response.json()
  return { id, domain }
}

function getDomain(handle: string) {
  const match = handle.match(/^(.+)@(.+)$/)
  if (!match || match.length < 2) {
    throw new Error(`Incorrect handle: ${handle}`)
  }
  const domain = match[2]
  return domain
}

async function accountFollows(
  handle: string,
  limit: number,
  logError: (x: string) => void
): Promise<Array<AccountDetails>> {
  let id, domain: string
  try {
    ;({ id, domain } = await usernameToId(handle))
  } catch (e) {
    logError(`Cannot find handle ${handle}.`)
    return []
  }

  let nextPage:
    | string
    | null = `https://${domain}/api/v1/accounts/${id}/following`
  let data: Array<AccountDetails> = []
  while (nextPage && data.length <= limit) {
    console.log(`Get page: ${nextPage}`)
    let response
    let page
    try {
      response = await fetch(nextPage)
      if (response.status !== 200) {
        throw new Error('HTTP request failed')
      }
      page = await response.json()
    } catch (e) {
      logError(`Error while retrieving followers for ${handle}.`)
      break
    }
    if (!page.map) {
      break
    }
    page = page.map((entry: AccountDetails) => {
      if (entry.acct && !/@/.test(entry.acct)) {
        // make sure the domain is always there
        entry.acct = `${entry.acct}@${domain}`
      }
      return entry
    })
    data = [...data, ...page]
    nextPage = getNextPage(response.headers.get('Link'))
  }
  return data
}

async function accountFofs(
  handle: string,
  setProgress: (x: Array<number>) => void,
  setFollows: (x: Array<AccountDetails>) => void,
  logError: (x: string) => void
): Promise<void> {
  const directFollows = await accountFollows(handle, 2000, logError)
  setProgress([0, directFollows.length])
  let progress = 0

  const directFollowIds = new Set(directFollows.map(({ acct }) => acct))
  directFollowIds.add(handle.replace(/^@/, ''))

  const indirectFollowLists: Array<Array<AccountDetails>> = []

  const updateList = debounce(() => {
    let indirectFollows: Array<AccountDetails> = [].concat(
      [],
      ...indirectFollowLists
    )
    const indirectFollowMap = new Map()

    indirectFollows
      .filter(
        // exclude direct follows and accounts who choose not to be discovered
        ({ acct, discoverable }) => !directFollowIds.has(acct) && discoverable
      )
      .map((account) => {
        const acct = account.acct
        if (indirectFollowMap.has(acct)) {
          const otherAccount = indirectFollowMap.get(acct)
          account.followed_by = new Set([
            ...Array.from(account.followed_by.values()),
            ...otherAccount.followed_by,
          ])
        }
        indirectFollowMap.set(acct, account)
      })

    const list = Array.from(indirectFollowMap.values()).sort((a, b) => {
      if (a.followed_by.size != b.followed_by.size) {
        return b.followed_by.size - a.followed_by.size
      }
      return b.followers_count - a.followers_count
    })

    setFollows(list)
  }, 2000)

  await Promise.all(
    directFollows.map(async ({ acct }) => {
      const follows = await accountFollows(acct, 200, logError)
      progress++
      setProgress([progress, directFollows.length])
      indirectFollowLists.push(
        follows.map((account) => ({ ...account, followed_by: new Set([acct]) }))
      )
      updateList()
    })
  )

  updateList.flush()
}

function getNextPage(linkHeader: string | null): string | null {
  if (!linkHeader) {
    return null
  }
  // Example header:
  // Link: <https://mastodon.example/api/v1/accounts/1/follows?limit=2&max_id=7628164>; rel="next", <https://mastodon.example/api/v1/accounts/1/follows?limit=2&since_id=7628165>; rel="prev"
  const match = linkHeader.match(/<(.+)>; rel="next"/)
  if (match && match.length > 0) {
    return match[1]
  }
  return null
}

function matchesSearch(account: AccountDetails, search: string): boolean {
  if (/^\s*$/.test(search)) {
    return true
  }
  const sanitizedSearch = search.replace(/^\s+|\s+$/, '').toLocaleLowerCase()
  if (account.acct.toLocaleLowerCase().includes(sanitizedSearch)) {
    return true
  }
  if (account.display_name.toLocaleLowerCase().includes(sanitizedSearch)) {
    return true
  }
  if (account.note.toLocaleLowerCase().includes(sanitizedSearch)) {
    return true
  }
  return false
}

export function Content({}) {
  const [handle, setHandle] = useState('')
  const [follows, setFollows] = useState<Array<AccountDetails>>([])
  const [isLoading, setLoading] = useState(false)
  const [isDone, setDone] = useState(false)
  const [domain, setDomain] = useState<string>('')
  const [[numLoaded, totalToLoad], setProgress] = useState<Array<number>>([
    0, 0,
  ])
  const [errors, setErrors] = useState<Array<string>>([])

  async function search(handle: string) {
    if (!/@/.test(handle)) {
      return
    }
    setErrors([])
    setLoading(true)
    setDone(false)
    setFollows([])
    setProgress([0, 0])
    setDomain(getDomain(handle))
    await accountFofs(handle, setProgress, setFollows, (error) =>
      setErrors((e) => [...e, error])
    )
    setLoading(false)
    setDone(true)
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-800" id="searchForm">
      <div className="px-4 py-8 mx-auto space-y-12 lg:space-y-20 lg:py-24 max-w-screen-xl">
        <form
          onSubmit={(e) => {
            search(handle)
            e.preventDefault()
            return false
          }}
        >
          <div className="form-group mb-6 text-4xl lg:ml-16">
            <label
              htmlFor="mastodonHandle"
              className="form-label inline-block mb-2 text-gray-700 dark:text-gray-200"
            >
              Your Mastodon handle:
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="form-control
        block
        w-80
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-900 focus:bg-white focus:border-green-600 focus:outline-none
        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-gray-200 dark:focus:bg-gray-900 dark:focus:text-gray-200
        "
              id="mastodonHandle"
              aria-describedby="mastodonHandleHelp"
              placeholder="johnmastodon@mas.to"
            />
            <small
              id="mastodonHandleHelp"
              className="block mt-1 text-xs text-gray-600 dark:text-gray-300"
            >
              Be sure to include the full handle, including the domain.
            </small>

            <button
              type="submit"
              className="
      px-6
      py-2.5
      bg-green-600
      text-white
      font-medium
      text-xs
      leading-tight
      uppercase
      rounded
      shadow-md
      hover:bg-green-700 hover:shadow-lg
      focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0
      active:bg-green-800 active:shadow-lg
      transition
      duration-150
      ease-in-out"
            >
              Search
              <Spinner
                visible={isLoading}
                className="w-4 h-4 ml-2 fill-white"
              />
            </button>

            {isLoading ? (
              <p className="text-sm dark:text-gray-400">
                Loaded {numLoaded} of {totalToLoad}...
              </p>
            ) : null}

            {isDone && follows.length === 0 ? (
              <div
                className="flex p-4 mt-4 max-w-full sm:max-w-xl text-sm text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-300"
                role="alert"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 inline w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Info</span>
                <div>
                  <span className="font-medium">No results found.</span> Please
                  double check for typos in the handle, and ensure that you
                  follow at least a few people to seed the search. Otherwise,
                  try again later as Mastodon may throttle requests.
                </div>
              </div>
            ) : null}
          </div>
        </form>

        {isDone || follows.length > 0 ? (
          <Results follows={follows} domain={domain} />
        ) : null}

        <ErrorLog errors={errors} />
      </div>
    </section>
  )
}

const AccountDetails = memo(
  ({
    account,
    mainDomain,
  }: {
    account: AccountDetails
    mainDomain: string
  }) => {
    const {
      avatar_static,
      display_name,
      acct,
      note,
      followers_count,
      followed_by,
    } = account
    let formatter = Intl.NumberFormat('en', { notation: 'compact' })
    let numFollowers = formatter.format(followers_count)

    const [expandedFollowers, setExpandedFollowers] = useState(false)

    return (
      <li className="px-4 py-3 pb-7 sm:px-0 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-shrink-0 m-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-16 h-16 sm:w-8 sm:h-8 rounded-full"
              src={avatar_static}
              alt={display_name}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
              {display_name}
            </p>
            <div className="flex flex-col sm:flex-row text-sm text-gray-500 dark:text-gray-400">
              <span className="truncate">{acct}</span>
              <span className="sm:inline hidden whitespace-pre"> | </span>
              <span>{numFollowers} followers</span>
            </div>
            <br />
            <small
              className="text-sm dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(note) }}
            ></small>
            <br />
            <small className="text-xs text-gray-800 dark:text-gray-400">
              Followed by{' '}
              {followed_by.size < 9 || expandedFollowers ? (
                Array.from<string>(followed_by.values()).map((handle, idx) => (
                  <React.Fragment key={handle}>
                    <span className="font-semibold">
                      {handle.replace(/@.+/, '')}
                    </span>
                    {idx === followed_by.size - 1 ? '.' : ', '}
                  </React.Fragment>
                ))
              ) : (
                <>
                  <button
                    onClick={() => setExpandedFollowers(true)}
                    className="font-semibold"
                  >
                    {followed_by.size} of your contacts
                  </button>
                  .
                </>
              )}
            </small>
          </div>
          <div className="inline-flex m-auto text-base font-semibold text-gray-900 dark:text-white">
            <a
              href={`https://${mainDomain}/@${acct.replace(
                '@' + mainDomain,
                ''
              )}`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              target="_blank"
              rel="noreferrer"
            >
              Follow
            </a>
          </div>
        </div>
      </li>
    )
  }
)
AccountDetails.displayName = 'AccountDetails'

function ErrorLog({ errors }: { errors: Array<string> }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      {errors.length > 0 ? (
        <div className="text-sm text-gray-600 dark:text-gray-200 border border-solid border-gray-200 dark:border-gray-700 rounded p-4 max-w-4xl mx-auto">
          Found{' '}
          <button className="font-bold" onClick={() => setExpanded(!expanded)}>
            {errors.length} warnings
          </button>
          {expanded ? ':' : '.'}
          {expanded
            ? errors.map((err) => (
                <p key={err} className="text-xs">
                  {err}
                </p>
              ))
            : null}
        </div>
      ) : null}
    </>
  )
}

function Results({
  domain,
  follows,
}: {
  domain: string
  follows: Array<AccountDetails>
}) {
  let [search, setSearch] = useState<string>('')
  const [isLoading, setLoading] = useState(false)
  const updateSearch = useRef(
    debounce((s: string) => {
      setLoading(false)
      setSearch(s)
    }, 100)
  ).current

  follows = follows.filter((acc) => matchesSearch(acc, search)).slice(0, 500)

  return (
    <div className="flex-col lg:flex items-center justify-center">
      <div className="max-w-4xl">
        <div className="w-full mb-4 dark:text-gray-200">
          <label>
            <div className="mb-2">
              <Spinner
                visible={isLoading}
                className="w-4 h-4 mr-1 fill-gray-400"
              />
              Search:
            </div>
            <SearchInput
              onChange={(s) => {
                setLoading(true)
                updateSearch(s)
              }}
            />
          </label>
        </div>
        <div className="content-center px-2 sm:px-8 py-4 bg-white border rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
          <div className="flow-root">
            {follows.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-200">
                No results found.
              </p>
            ) : null}
            <ul
              role="list"
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              {follows.map((account) => (
                <AccountDetails
                  key={account.acct}
                  account={account}
                  mainDomain={domain}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchInput({ onChange }: { onChange: (s: string) => void }) {
  let [search, setSearchInputValue] = useState<string>('')
  return (
    <input
      type="text"
      placeholder="London"
      value={search}
      onChange={(e) => {
        setSearchInputValue(e.target.value)
        onChange(e.target.value)
      }}
      className="
                form-control
                block
                w-80
                px-3
                py-1.5
                text-base
                font-normal
                text-gray-700
                bg-white bg-clip-padding
                border border-solid border-gray-300
                rounded
                transition
                ease-in-out
                m-0
                focus:text-gray-900 focus:bg-white focus:border-green-600 focus:outline-none
                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-gray-200 dark:focus:bg-gray-900 dark:focus:text-gray-200"
    />
  )
}
