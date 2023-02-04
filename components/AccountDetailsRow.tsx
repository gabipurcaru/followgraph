import React, { useState, memo } from 'react';
import sanitizeHtml from 'sanitize-html';
import { AccountDetails } from './api';

export const AccountDetailsRow = memo(
  ({
    account, mainDomain,
  }: {
    account: AccountDetails;
    mainDomain: string;
  }) => {
    const {
      avatar_static, display_name, acct, note, followers_count, followed_by,
    } = account;
    let formatter = Intl.NumberFormat('en', { notation: 'compact' });
    let numFollowers = formatter.format(followers_count);

    const [expandedFollowers, setExpandedFollowers] = useState(false);

    return (
      <li className="px-4 py-3 pb-7 sm:px-0 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-shrink-0 m-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-16 h-16 sm:w-8 sm:h-8 rounded-full"
              src={avatar_static}
              alt={display_name} />
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
    );
  }
);
AccountDetailsRow.displayName = 'AccountDetailsRow';
