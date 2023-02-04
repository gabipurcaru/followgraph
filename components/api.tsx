import debounce from 'debounce';

export type AccountDetails = {
  /**
   * // IMPORTANT
   * Mastodon uses int64 so will overflow Javascript's number type
   * Pleroma uses 128-bit ids. However just like Mastodon's ids they are lexically sortable strings
   */
  id: string;
  acct: string;
  followed_by: Set<string>; // list of handles
  followers_count: number;
  discoverable: boolean;
  display_name: string;
  note: string;
  avatar_static: string;
};

async function usernameToId(
  handle: string
): Promise<{ id: string; domain: string; }> {
  const match = handle.match(/^(.+)@(.+)$/);
  if (!match || match.length < 2) {
    throw new Error(`Incorrect handle: ${handle}`);
  }
  const domain = match[2];
  const username = match[1];
  let response = await fetch(
    `https://${domain}/api/v1/accounts/lookup?acct=${username}`
  );
  if (response.status !== 200) {
    throw new Error('HTTP request failed');
  }
  const { id } = await response.json();
  return { id, domain };
}
export function getDomain(handle: string) {
  const match = handle.match(/^(.+)@(.+)$/);
  if (!match || match.length < 2) {
    throw new Error(`Incorrect handle: ${handle}`);
  }
  const domain = match[2];
  return domain;
}

async function accountFollows(
  handle: string,
  limit: number,
  logError: (x: string) => void
): Promise<Array<AccountDetails>> {
  let id, domain: string;
  try {
    ; ({ id, domain } = await usernameToId(handle));
  } catch (e) {
    logError(`Cannot find handle ${handle}.`);
    return [];
  }

  let nextPage: string |
    null = `https://${domain}/api/v1/accounts/${id}/following`;
  let data: Array<AccountDetails> = [];
  while (nextPage && data.length <= limit) {
    console.log(`Get page: ${nextPage}`);
    let response;
    let page;
    try {
      response = await fetch(nextPage);
      if (response.status !== 200) {
        throw new Error('HTTP request failed');
      }
      page = await response.json();
    } catch (e) {
      logError(`Error while retrieving followers for ${handle}.`);
      break;
    }
    if (!page.map) {
      break;
    }
    page = page.map((entry: AccountDetails) => {
      if (entry.acct && !/@/.test(entry.acct)) {
        // make sure the domain is always there
        entry.acct = `${entry.acct}@${domain}`;
      }
      return entry;
    });
    data = [...data, ...page];
    nextPage = getNextPage(response.headers.get('Link'));
  }
  return data;
}
export async function accountFofs(
  handle: string,
  setProgress: (x: Array<number>) => void,
  setFollows: (x: Array<AccountDetails>) => void,
  logError: (x: string) => void): Promise<void> {
  const directFollows = await accountFollows(handle, 2000, logError);
  setProgress([0, directFollows.length]);
  let progress = 0;

  const directFollowIds = new Set(directFollows.map(({ acct }) => acct));
  directFollowIds.add(handle.replace(/^@/, ''));

  const indirectFollowLists: Array<Array<AccountDetails>> = [];

  const updateList = debounce(() => {
    let indirectFollows: Array<AccountDetails> = [].concat(
      [],
      ...indirectFollowLists
    );
    const indirectFollowMap = new Map();

    indirectFollows
      .filter(
        // exclude direct follows and accounts who choose not to be discovered
        ({ acct, discoverable }) => !directFollowIds.has(acct) && discoverable
      )
      .map((account) => {
        const acct = account.acct;
        if (indirectFollowMap.has(acct)) {
          const otherAccount = indirectFollowMap.get(acct);
          account.followed_by = new Set([
            ...Array.from(account.followed_by.values()),
            ...otherAccount.followed_by,
          ]);
        }
        indirectFollowMap.set(acct, account);
      });

    const list = Array.from(indirectFollowMap.values()).sort((a, b) => {
      if (a.followed_by.size != b.followed_by.size) {
        return b.followed_by.size - a.followed_by.size;
      }
      return b.followers_count - a.followers_count;
    });

    setFollows(list);
  }, 2000);

  await Promise.all(
    directFollows.map(async ({ acct }) => {
      const follows = await accountFollows(acct, 200, logError);
      progress++;
      setProgress([progress, directFollows.length]);
      indirectFollowLists.push(
        follows.map((account) => ({ ...account, followed_by: new Set([acct]) }))
      );
      updateList();
    })
  );

  updateList.flush();
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
