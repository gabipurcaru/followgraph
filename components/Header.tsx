import React from "react";
export default function Header() {
    return (<header className="fixed w-full">
        <nav className="bg-white border-gray-200 py-2.5 dark:bg-gray-900">
            <div className="flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto">
                <Logo />

                <div className="items-center justify-between hidden w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                    <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                        <MenuItem link="#" selected>Home</MenuItem>
                        <MenuItem link="#faq">FAQ</MenuItem>
                        <MenuItem link="https://github.com/gabipurcaru/followgraph">Fork me on GitHub</MenuItem>
                    </ul>
                </div>
            </div>
        </nav>
    </header>);

    function Logo({ }) {
        return (<a href="#" className="flex items-center">
            <svg className="w-12 h-12 mr-4 dark:fill-white" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 342.68"><path d="M3.59 300.55a3.59 3.59 0 0 1-3.59-3.6c0-1.02.14-2.03.38-3.03 5.77-45.65 41.51-57.84 66.87-64.42 12.69-3.29 44.26-15.82 31.68-33.04-7.05-9.67-13.44-16.47-19.83-26.68-4.61-6.81-7.04-12.88-7.04-17.75 0-5.19 2.75-11.27 8.26-12.64-.73-10.45-.97-24.2-.48-35.39 1.75-19.2 15.52-33.35 33.31-39.62 7.05-2.68 3.64-13.38 11.42-13.62 18.24-.49 48.14 15.07 59.82 27.71 6.81 7.3 11.18 17.02 11.91 29.91l-.73 32.22c3.4.98 5.59 3.16 6.57 6.56.97 3.89 0 9.25-3.41 16.79 0 .24-.24.24-.24.48-7.51 12.37-15.33 20.56-23.92 32.03-3.84 5.11-3.09 10.01.1 14.41-4.48 2.62-8.85 5.62-13.06 9.16-16.76 14.07-29.68 35.08-34.13 68.61l-.5 2.9c-.24 1.9-.38 3.48-.38 4.66 0 1.48.13 2.93.37 4.35H3.59zM428 174.68c46.41 0 84 37.62 84 84 0 46.4-37.62 84-84 84-46.4 0-84-37.62-84-84 0-46.41 37.61-84 84-84zm-13.25 49.44c-.03-3.91-.39-6.71 4.46-6.64l15.7.19c5.07-.03 6.42 1.58 6.36 6.33v21.43h21.3c3.91-.04 6.7-.4 6.63 4.45l-.19 15.71c.03 5.07-1.58 6.42-6.32 6.36h-21.42v21.41c.06 4.75-1.29 6.36-6.36 6.33l-15.7.18c-4.85.08-4.49-2.72-4.46-6.63v-21.29h-21.43c-4.75.06-6.35-1.29-6.32-6.36l-.19-15.71c-.08-4.85 2.72-4.49 6.62-4.45h21.32v-21.31zm-261.98 76.47c-2.43 0-4.39-1.96-4.39-4.39 0-1.25.17-2.48.47-3.7 7.03-55.71 40.42-67.83 71.33-75.78 14.84-3.82 44.44-18.71 40.85-37.91-7.49-6.94-14.92-16.53-16.21-30.83l-.9.02c-2.07-.03-4.08-.5-5.95-1.56-4.13-2.35-6.4-6.85-7.49-11.99-2.29-15.67-2.86-23.67 5.49-27.17l.07-.02c-1.04-19.34 2.23-47.79-17.63-53.8 39.21-48.44 84.41-74.8 118.34-31.7 37.81 1.98 54.67 55.54 31.19 85.52h-.99c8.36 3.5 7.1 12.49 5.49 27.17-1.09 5.14-3.36 9.64-7.49 11.99-1.87 1.06-3.87 1.53-5.95 1.56l-.9-.02c-1.29 14.3-8.74 23.89-16.23 30.83-1.01 5.43.63 10.52 3.84 15.11-14.05 17.81-22.44 40.31-22.44 64.76 0 14.89 3.11 29.07 8.73 41.91H152.77z" /></svg>
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Followgraph for Mastodon</span>
        </a>);
    }
}

function MenuItem({ link, children, selected }: { link: string, children: string | React.ReactElement, selected?: boolean }) {
    return (<li>
        {selected ?
            <a href={link} className="block py-2 pl-3 pr-4 text-white bg-purple-700 rounded lg:bg-transparent lg:text-purple-700 lg:p-0 dark:text-white" aria-current="page">
                {children}
            </a>
            :
            <a href={link} className="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-300 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">
                {children}
            </a>
        }
    </li>);
}
