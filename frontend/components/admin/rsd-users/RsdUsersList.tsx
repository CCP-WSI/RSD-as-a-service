// SPDX-FileCopyrightText: 2023 Dusan Mijatovic (dv4all)
// SPDX-FileCopyrightText: 2023 dv4all
//
// SPDX-License-Identifier: Apache-2.0

import {useState} from 'react'

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import List from '@mui/material/List'

import {useSession} from '~/auth'
import ConfirmDeleteModal from '~/components/layout/ConfirmDeleteModal'
import ContentLoader from '~/components/layout/ContentLoader'
import {RsdAccountInfo, useLoginForAccount} from './apiRsdUsers'
import RsdAccountItem from './RsdAccountItem'

export type DeleteAccountModal = {
  open: boolean,
  account?: RsdAccountInfo
}

export default function RsdUsersList() {
  const {token} = useSession()
  const {loading, accounts, deleteAccount} = useLoginForAccount(token)
  const [modal, setModal] = useState<DeleteAccountModal>({
    open: false
  })

  if (loading) return <ContentLoader />

  if (accounts.length === 0) {
    return (
      <section className="flex-1">
        <Alert severity="warning" sx={{marginTop:'0.5rem'}}>
          <AlertTitle sx={{fontWeight:500}}>No users</AlertTitle>
          An user is <strong>automatically added after first login</strong>.
        </Alert>
      </section>
    )
  }

  function onDeleteAccount(account:RsdAccountInfo) {
    if (account) {
      setModal({
        open: true,
        account
      })
    }
  }

  return (
    <>
      <List sx={{
        width: '100%',
      }}>
        {
          accounts.map(item => {
            return (
              <RsdAccountItem
                key={item.id}
                account={item}
                onDelete={()=>onDeleteAccount(item)}
              />
            )
          })
        }
      </List>
      <ConfirmDeleteModal
        open={modal.open}
        title="Remove account"
        body={
          <>
            <p>
              Are you sure you want to delete the account <strong>{modal?.account?.id}</strong>?
            </p>
            <p className="mt-4">
              The owner will lose access to all pages they maintained and all unused maintainer invites they created will be deleted.
            </p>
          </>
        }
        onCancel={() => {
          setModal({
            open: false
          })
        }}
        onDelete={() => {
          deleteAccount(modal?.account?.id ?? '')
          setModal({
            open: false
          })
        }}
      />
    </>
  )
}
