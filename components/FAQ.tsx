import React, { useState } from "react";
export function FAQ({ }) {
  return <section className="bg-white dark:bg-gray-900 pt-12">
    <div className="max-w-screen-xl px-4 pb-8 mx-auto lg:pb-24 lg:px-6" id="faq">
      <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-center text-gray-900 lg:mb-8 lg:text-3xl dark:text-white">Frequently asked questions</h2>
      <div className="max-w-screen-md mx-auto">
        <div id="accordion-flush" data-accordion="collapse" data-active-classes="bg-white dark:bg-gray-900 text-gray-900 dark:text-white" data-inactive-classes="text-gray-500 dark:text-gray-400">
          <FAQItem defaultSelected title="How does this work?">
            The tool looks up all the people you follow, and then the people <em>they</em> follow. Then
            it sorts them by the number of mutuals, or otherwise by how popular those accounts are.
          </FAQItem>

          <FAQItem title="Do I need to grant the app any permissions?">
            Not at all! This app uses public APIs to fetch potential people you can follow on Mastodon. In fact, it only does inauthenticated network requests to various
            Mastodon instances.
          </FAQItem>

          <FAQItem title="Help! The search got stuck.">
            Don&apos;t worry. The list of suggestions will load in 30 seconds or so. Sometimes it gets stuck because one or more of the queries
            made to Mastodon time out. This is not a problem, because the rest of the queries will work as expected.
          </FAQItem>

          <FAQItem title="How can I contribute with suggestions?">
            Click the &quot;Fork me on Github&quot; link on the top right, and open up an issue.
          </FAQItem>

          <FAQItem title="Why is this not a core Mastodon feature?">
            Well, maybe it should be. In the meantime, you can use this website.
          </FAQItem>
        </div>
      </div>
    </div>
  </section>;
}

function FAQItem({ defaultSelected, title, children }: { defaultSelected?: boolean, title: string, children: React.ReactNode}) {
  const [selected, setSelected] = useState(defaultSelected);
  return (<>
    <h3 id="accordion-flush-heading-1">
      <button type="button" onClick={() => setSelected(!selected)} className={`flex items-center justify-between w-full py-5 font-medium text-left text-gray-${selected ? 900 : 500} bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-${selected ? 200 : 400}`} data-accordion-target="#accordion-flush-body-1" aria-expanded="true" aria-controls="accordion-flush-body-1">
        <span>{title}</span>
        <svg data-accordion-icon className="w-6 h-6 rotate-180 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>
    </h3>
    {selected ?
      <div id="accordion-flush-body-1" aria-labelledby="accordion-flush-heading-1">
        <div className="py-5 border-b border-gray-200 dark:border-gray-700 dark:text-gray-300">
          {children}
        </div>
      </div> : null}
  </>);
}
