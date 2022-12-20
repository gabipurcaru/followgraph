import React, { useState } from "react";
import sanitizeHtml from 'sanitize-html';

type AccountDetails = {
  id: string, // IMPORTANT: this is int64 so will overflow Javascript's number type
  acct: string,
  followed_by: Array<string>, // list of handles
};

async function usernameToId(handle: string): Promise<{ id: number, domain: string }> {
  const match = handle.match(/^(.+)@(.+)$/);
  if (!match || match.length < 2) {
    throw new Error(`Incorrect handle: ${handle}`);
  }
  const domain = match[2];
  const username = match[1];
  let response = await fetch(`https://${domain}/api/v1/accounts/lookup?acct=${username}`);
  const { id } = await response.json();
  return { id, domain };
}

function getDomain(handle: string) {
  const match = handle.match(/^(.+)@(.+)$/);
  if (!match || match.length < 2) {
    throw new Error(`Incorrect handle: ${handle}`);
  }
  const domain = match[2];
  return domain;
}

async function accountFollows(handle: string): Promise<Array<AccountDetails>> {
  let id, domain: string;
  try {
    ({ id, domain } = await usernameToId(handle));
  } catch (e) {
    return [];
  }

  let nextPage: string | null = `https://${domain}/api/v1/accounts/${id}/following`;
  let data: Array<AccountDetails> = [];
  while (nextPage && data.length <= 50) {
    console.log(`Get page: ${nextPage}`);
    let response;
    let page;
    try {
      response = await fetch(nextPage);
      page = await response.json();
    } catch (e) {
      console.log(e);
      break;
    }
    if (!page.map) {
      break;
    }
    page = page.map((entry: AccountDetails) => {
      if (entry.acct && !/@/.test(entry.acct)) {
        // make sure the domain is always there
        entry.acct = `${entry.acct}@${domain}`;
      };
      return entry;
    })
    data = [...data, ...page];
    nextPage = getNextPage(response.headers.get('Link'));
  }
  return data;
}

async function accountFofs(handle: string, setProgress: (x: Array<number>) => void): Promise<Array<AccountDetails>> {
  console.log('Start');
  const directFollows = await accountFollows(handle);
  setProgress([0, directFollows.length]);
  console.log(`Direct follows: ${directFollows.length}`);
  let progress = 0;
  const indirectFollowLists = await Promise.all(
    directFollows.map(
      async ({ acct }) => {
        const follows = await accountFollows(acct);
        progress++;
        setProgress([progress, directFollows.length]);
        return follows.map(account => ({...account, followed_by: [acct]}));
      }
    ),
  );

  let indirectFollows: Array<AccountDetails> = [].concat([], ...indirectFollowLists);
  const indirectFollowMap = new Map();
  
  const directFollowIds = new Set(directFollows.map(({ acct }) => acct));

  indirectFollows.filter(
    // exclude direct follows
    ({ acct }) => !directFollowIds.has(acct)
  ).map(account => {
    const acct = account.acct;
    if (indirectFollowMap.has(acct)) {
      const otherAccount = indirectFollowMap.get(acct);
      account.followed_by = [...account.followed_by, ...otherAccount.followed_by];
    }
    indirectFollowMap.set(acct, account);
  });

  return Array.from(indirectFollowMap.values()).sort((a, b) => {
    if (a.followed_by.length != b.followed_by.length) {
      return b.followed_by.length - a.followed_by.length;
    }
    return b.followers_count - a.followers_count;
  });
}

function getNextPage(linkHeader: string | null): string | null {
  if (!linkHeader) {
    return null;
  }
  // Example header:
  // Link: <https://mastodon.example/api/v1/accounts/1/follows?limit=2&max_id=7628164>; rel="next", <https://mastodon.example/api/v1/accounts/1/follows?limit=2&since_id=7628165>; rel="prev"
  const match = linkHeader.match(/<(.+)>; rel="next"/);
  if (match && match.length > 0) {
    return match[1];
  }
  return null;
}

export function Content({ }) {
  const [handle, setHandle] = useState("");
  const [follows, setfollows] = useState<Array<AccountDetails>>([]);
  const [isLoading, setLoading] = useState(false);
  const [isDone, setDone] = useState(false);
  const [domain, setDomain] = useState<string>("");
  const [[numLoaded, totalToLoad], setProgress] = useState<Array<number>>([0, 0]);

  console.log(follows.length);

  async function search(handle: string) {
    if (!/@/.test(handle)) {
      return;
    }
    setLoading(true);
    setDomain(getDomain(handle));
    setfollows(await accountFofs(handle, setProgress));
    setLoading(false);
    setDone(true);
  }

  return <section className="bg-gray-50 dark:bg-gray-800" id="searchForm">
    <div className="px-4 py-8 mx-auto space-y-12 lg:space-y-20 lg:py-24 lg:px-6">
      <form onSubmit={e => {
        search(handle);
        e.preventDefault();
        return false;
      }}>
        <div className="form-group mb-6  text-4xl lg:ml-16">
          <label htmlFor="mastodonHandle" className="form-label inline-block mb-2 text-gray-700 dark:text-gray-200">Your Mastodon handle:</label>
          <input type="text" value={handle} onChange={e => setHandle(e.target.value)} className="form-control
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
        " id="mastodonHandle"
            aria-describedby="mastodonHandleHelp" placeholder="johnmastodon@mas.to" />
          <small id="mastodonHandleHelp" className="block mt-1 text-xs text-gray-600 dark:text-gray-300">Be sure to include the full handle, including the domain.</small>
        
        <button type="submit" className="
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
      ease-in-out">
          Search
          {isLoading ?
            <svg className="w-4 h-4 ml-2 fill-white animate-spin inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{/*! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M304 48c0-26.5-21.5-48-48-48s-48 21.5-48 48s21.5 48 48 48s48-21.5 48-48zm0 416c0-26.5-21.5-48-48-48s-48 21.5-48 48s21.5 48 48 48s48-21.5 48-48zM48 304c26.5 0 48-21.5 48-48s-21.5-48-48-48s-48 21.5-48 48s21.5 48 48 48zm464-48c0-26.5-21.5-48-48-48s-48 21.5-48 48s21.5 48 48 48s48-21.5 48-48zM142.9 437c18.7-18.7 18.7-49.1 0-67.9s-49.1-18.7-67.9 0s-18.7 49.1 0 67.9s49.1 18.7 67.9 0zm0-294.2c18.7-18.7 18.7-49.1 0-67.9S93.7 56.2 75 75s-18.7 49.1 0 67.9s49.1 18.7 67.9 0zM369.1 437c18.7 18.7 49.1 18.7 67.9 0s18.7-49.1 0-67.9s-49.1-18.7-67.9 0s-18.7 49.1 0 67.9z"/></svg>
          : null}
          </button>
          
      {isLoading ?
        <p className="text-sm dark:text-gray-400">Loaded {numLoaded} from {totalToLoad}...</p>
      : null}
        </div>
      </form>
    
      
      {isDone ?
        <div className="flex items-center justify-center">
          <div className="max-w-4xl content-center px-8 py-4 bg-white border rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
            <div className="flow-root">
              <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                {follows.slice(0, 100).map(account => <AccountDetails key={account.acct} account={account} mainDomain={domain} />)}
              </ul>
            </div>
          </div>
          </div>
        : null}
      </div>
  </section>;
}

function AccountDetails({ account, mainDomain }) {
  const { avatar_static, display_name, acct, note, followers_count, followed_by } = account;
  let formatter = Intl.NumberFormat('en', { notation: 'compact' });
  let numfollows = formatter.format(followers_count);
  console.log(account);
  
  return (
    <li className="py-3 sm:py-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <img className="w-8 h-8 rounded-full" src={avatar_static} alt={display_name} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
            {display_name}
          </p>
          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
            {acct} | {numfollows} follows
          </p>
          <br />
          <small className="text-sm dark:text-gray-200" dangerouslySetInnerHTML={{ __html: sanitizeHtml(note) }}></small>
          <br />
          <small className="text-xs text-gray-800 dark:text-gray-400">
            Followed by{' '}
            {followed_by.map((handle, idx) => (
              <><span className="font-semibold">{handle.replace(/@.+/, '')}</span>{idx === followed_by.length - 1 ? '' : ', '}</>
            ))}
          </small>
        </div>
        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
          <a href={`https://${mainDomain}/@${acct}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Follow
          </a>
        </div>
      </div>
    </li>
  );
}