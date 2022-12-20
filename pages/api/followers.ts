// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Array<AccountDetails>>
) {
  const domain = 'mastodon.online';
  // const credentials = await createApp(domain);

  // console.log(credentials);

  // const url = createOauthUrl(credentials, domain);

  // console.log(url);


  // const token = "COETdTghIFAL6hNGbRGiHbxUeU4WjuNyL1X2lu9KT0o";
  // const { token } = req.query;

  // const acct = 'gabipurcaru@mastodon.online';
  // const follows = await accountFollows(acct, token, domain);

  // console.log(follows.length);


  // const id = 109265004581756329;
  const follows = await accountFofs('gabipurcaru@mastodon.online');
  console.log(follows.length);
  res.status(200).json(follows);  //follows.map(({ acct }) => ({ acct })));
}
