import React from 'react'
export default function Footer({}) {
  return (
    <footer className="bg-white dark:bg-gray-800">
      <div className="max-w-screen-xl p-4 py-6 mx-auto lg:py-16 md:p-8 lg:p-10">
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <div className="text-center">
          <div className="mb-5 lg:text-2xl font-semibold text-gray-700 dark:text-white text-lg">
            Followgraph for Mastodon, built by&nbsp;{' '}
            <a
              href="https://mastodon.online/@gabipurcaru"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-gray-900 dark:text-gray-400"
            >
              @gabipurcaru@mastodon.online
            </a>
            .
          </div>
          <span className="block text-sm text-center text-gray-500 dark:text-gray-400">
            Built with{' '}
            <a
              href="https://flowbite.com"
              className="text-purple-600 hover:underline dark:text-purple-500"
              rel="nofollow noopener noreferrer"
            >
              Flowbite
            </a>{' '}
            and{' '}
            <a
              href="https://tailwindcss.com"
              className="text-purple-600 hover:underline dark:text-purple-500"
              rel="nofollow noopener noreferrer"
            >
              Tailwind CSS
            </a>
            .
          </span>
        </div>
      </div>
    </footer>
  )
}
