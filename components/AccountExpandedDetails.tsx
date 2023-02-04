import React from 'react'
import { AccountDetails } from './api'

export function AccountExpandedDetails({
  account,
}: {
  account: AccountDetails
}) {
  return <>expanded! {account.display_name}</>
}
