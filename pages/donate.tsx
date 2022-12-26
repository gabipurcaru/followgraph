import Footer from './../components/Footer'
import Donate from './../components/Donate'
import Header from './../components/Header'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Followgraph for Mastodon</title>
        <meta
          name="description"
          content="If you liked Followgraph for Mastodon, please consider donating."
        />
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
        <Header selected="donate" />
        <Donate />

        <Footer />
      </div>
    </>
  )
}
