import Footer from './../components/Footer'
import Donate from './../components/Donate'
import Header from './../components/Header'
import Head from 'next/head'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Followgraph for Mastodon</title>
        <meta name="description" content="Privacy policy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://followgraph.vercel.app/",
            "image": {
              "@type": "ImageObject",
              "@id": "https://followgraph.vercel.app/#/schema/ImageObject/FollowGraphThumbnail",
              "url": "/ldjson-logo.jpg",
              "contentUrl": "/ldjson-logo.jpg",
              "caption": "Followgraph for Mastodon",
              "width": 345,
              "height": 345
              }
            }`}
        </script>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <Header selected="privacy" />
        <section className="pt-32 dark:bg-gray-800">
          <div className="prose dark:prose-invert max-w-5xl px-10">
            <h1>tl;dr</h1>
            <p>
              Please refer to the full Privacy Policy below. The short summary
              is that Followgraph is a static website which{' '}
              <strong>
                sets no cookies and requires no authentication. The only data
                gathered is through{' '}
                <a href="https://vercel.com/analytics">Vercel Analytics</a>
              </strong>
              , which gathers aggregated visitor and demographic statistics
              about site visitors in a privacy-sensitive way.
            </p>
            <h1>Privacy Policy for Followgraph for Mastodon</h1>

            <p>
              At Followgraph for Mastodon, accessible from
              https://followgraph.vercel.app/, one of our main priorities is the
              privacy of our visitors. This Privacy Policy document contains
              types of information that is collected and recorded by Followgraph
              for Mastodon and how we use it.
            </p>

            <p>
              If you have additional questions or require more information about
              our Privacy Policy, do not hesitate to contact us.
            </p>

            <h2>Log Files</h2>

            <p>
              Followgraph for Mastodon follows a standard procedure of using log
              files. These files log visitors when they visit websites. All
              hosting companies do this and a part of hosting services&apos;
              analytics. The information collected by log files include internet
              protocol (IP) addresses, browser type, Internet Service Provider
              (ISP), date and time stamp, referring/exit pages, and possibly the
              number of clicks. These are not linked to any information that is
              personally identifiable. The purpose of the information is for
              analyzing trends, administering the site, tracking users&apos;
              movement on the website, and gathering demographic information.
              Our Privacy Policy was created with the help of the{' '}
              <a href="https://www.privacypolicyonline.com/privacy-policy-generator/">
                Privacy Policy Generator
              </a>
              .
            </p>

            <h2>Third Party Privacy Policies</h2>

            <p>
              Followgraph for Mastodon&apos;s Privacy Policy does not apply to
              other websites. In particular, Followgraph uses Vercel Analytics
              to gather basic information about site usage. You can find Vercel
              Analytics&apos; Privacy Policy here:
              https://vercel.com/legal/privacy-policy.
            </p>

            <h2>Children&apos;s Information</h2>

            <p>
              Another part of our priority is adding protection for children
              while using the internet. We encourage parents and guardians to
              observe, participate in, and/or monitor and guide their online
              activity.
            </p>

            <p>
              Followgraph for Mastodon does not knowingly collect any Personal
              Identifiable Information from children under the age of 13. If you
              think that your child provided this kind of information on our
              website, we strongly encourage you to contact us immediately and
              we will do our best efforts to promptly remove such information
              from our records.
            </p>

            <h2>Online Privacy Policy Only</h2>

            <p>
              This Privacy Policy applies only to our online activities and is
              valid for visitors to our website with regards to the information
              that they shared and/or collect in Followgraph for Mastodon. This
              policy is not applicable to any information collected offline or
              via channels other than this website.
            </p>

            <h2>Consent</h2>

            <p>
              By using our website, you hereby consent to our Privacy Policy and
              agree to its Terms and Conditions.
            </p>
          </div>
        </section>
        <Footer />
      </div>
    </>
  )
}
