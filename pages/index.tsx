import { Content } from './../components/Content';
import { FAQ } from './../components/FAQ';
import Footer from './../components/Footer';
import Hero from './../components/Hero';
import Header from './../components/Header';
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Followgraph for Mastodon</title>
        <meta name="description" content="Find people to follow on Mastodon by expanding your follow graph." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <Header />
        <Hero />
        <Content />
        <FAQ />

        <Footer />
      </div>
    </>
  )
}
