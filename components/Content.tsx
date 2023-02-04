import { Spinner } from './Spinner'
import React, { useState, useRef } from 'react'
import debounce from 'debounce'
import { AccountDetailsRow } from './AccountDetailsRow'
import { AccountDetails, getDomain, accountFofs } from './api'

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
    }, 1500)
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
                <AccountDetailsRow
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
