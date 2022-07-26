// SPDX-FileCopyrightText: 2021 - 2022 Dusan Mijatovic (dv4all)
// SPDX-FileCopyrightText: 2021 - 2022 dv4all
//
// SPDX-License-Identifier: Apache-2.0

import {MouseEvent, ChangeEvent} from 'react'
import Head from 'next/head'
import {useRouter} from 'next/router'
import {GetServerSidePropsContext} from 'next/types'
import TablePagination from '@mui/material/TablePagination'
import useMediaQuery from '@mui/material/useMediaQuery'

import {app} from '../../config/app'
import DefaultLayout from '../../components/layout/DefaultLayout'
import PageTitle from '../../components/layout/PageTitle'
import Searchbox from '../../components/form/Searchbox'
import SoftwareGrid from '../../components/software/SoftwareGrid'
import {SoftwareListItem} from '../../types/SoftwareTypes'
import {rowsPerPageOptions} from '../../config/pagination'
import {getSoftwareList} from '../../utils/getSoftware'
import {ssrSoftwareParams} from '../../utils/extractQueryParam'
import {softwareListUrl,softwareUrl} from '../../utils/postgrestUrl'
import KeywordFilter from '~/components/keyword/KeywordFilter'

type SoftwareIndexPageProps = {
  count: number,
  page: number,
  rows: number,
  keywords?: string[],
  software: SoftwareListItem[],
  search?:string
}

const pageTitle = `Software | ${app.title}`

export default function SoftwareIndexPage({software=[],count,page,rows,keywords,search}:SoftwareIndexPageProps) {
  // use next router (hook is only for browser)
  const router = useRouter()
  // use media query hook for small screen logic
  const smallScreen = useMediaQuery('(max-width:600px)')
  // adjust grid min width for mobile to 18rem
  const minWidth = smallScreen ? '18rem' : '26rem'


  // console.log('keywords...', keywords)

  // next/previous page button
  function handlePageChange(
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) {
    const url = softwareUrl({
      // take existing params from url (query)
      ...ssrSoftwareParams(router.query),
      page: newPage
    })
    router.push(url)
  }

  // change number of cards per page
  function handleItemsPerPage(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ){
    const url = softwareUrl({
      // take existing params from url (query)
      ...ssrSoftwareParams(router.query),
      // reset to first page
      page: 0,
      rows: parseInt(event.target.value),
    })
    router.push(url)
  }

  function handleSearch(searchFor: string) {
    // debugger
    const url = softwareUrl({
      // take existing params from url (query)
      ...ssrSoftwareParams(router.query),
      search: searchFor,
      // start from first page
      page: 0
    })
    router.push(url)
  }

  function handleFilters(keywords:string[]){
    const url = softwareUrl({
      // take existing params from url (query)
      ...ssrSoftwareParams(router.query),
      keywords,
      // start from first page
      page: 0
    })
    router.push(url)
  }

  // TODO! handle sort options
  // function handleSort(sortOn:string){
  //   logger(`software.index.handleSort: TODO! Sort on...${sortOn}`,'warn')
  // }

  return (
    <DefaultLayout>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <PageTitle title="Software">
        <div className="md:flex flex-wrap justify-end">
          <div className="flex items-center">
            <Searchbox
              placeholder="Search for software"
              onSearch={handleSearch}
              defaultValue={search}
            />
            <KeywordFilter
              items={keywords ?? []}
              onApply={handleFilters}
            />
          </div>
          <TablePagination
            component="nav"
            count={count}
            page={page}
            labelRowsPerPage="Per page"
            onPageChange={handlePageChange}
            rowsPerPage={rows}
            rowsPerPageOptions={rowsPerPageOptions}
            onRowsPerPageChange={handleItemsPerPage}
          />
        </div>
      </PageTitle>
      <SoftwareGrid
        className='gap-[0.125rem] p-[0.125rem] pt-4 pb-12'
        grid={{
          height: '17rem',
          minWidth,
          maxWidth:'1fr'
        }}
        software={software}
      />
    </DefaultLayout>
  )
}

// fetching data server side
// see documentation https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering
export async function getServerSideProps(context:GetServerSidePropsContext) {
  // extract params from page-query
  const {search, keywords, rows, page} = ssrSoftwareParams(context.query)
  // construct postgREST api url with query params
  const url = softwareListUrl({
    baseUrl: process.env.POSTGREST_URL || 'http://localhost:3500',
    search,
    keywords,
    order:'mention_cnt.desc.nullslast,contributor_cnt.desc.nullslast,updated_at.desc.nullslast',
    limit: rows,
    offset: rows * page
  })

  // get software list, we do not pass the token
  // when token is passed it will return not published items too
  const software = await getSoftwareList({url})

  // will be passed as props to page
  // see params of SoftwareIndexPage function
  return {
    props: {
      search,
      keywords,
      count: software.count,
      page,
      rows,
      software: software.data,
    },
  }
}
