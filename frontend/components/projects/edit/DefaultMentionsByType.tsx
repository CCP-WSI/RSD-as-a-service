import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Badge from '@mui/material/Badge'
import LinkIcon from '@mui/icons-material/Link'

import {mentionType, MentionType, MentionForSoftware, MentionForProject} from '~/types/Mention'
import {sortOnDateProp} from '~/utils/sortFn'
import {isoStrToLocalDateStr} from '~/utils/dateFn'
import Link from 'next/link'

export type MentionByType={
  [key:string]: MentionForSoftware[] | MentionForProject[]
}

export default function DefaultMentionsByType({mentionByType}: { mentionByType: MentionByType }) {
  const mentionTypes = Object.keys(mentionByType).sort()
  return (
    <>
      {mentionTypes.map((key) => {
        const items = mentionByType[key]
        return renderMentionSectionForType(key as MentionType, items)
      })}
    </>
  )
}

function renderMentionSectionForType(key: MentionType, items: MentionForSoftware[]) {
  // do not render accordion/section if no items
  if (items.length===0) return null
  return (
    <Accordion
      data-testid='default-mentions-by-type'
      key={key}
      sx={{
        boxShadow: 0,
        borderTop: '1px solid',
        borderColor: 'divider',
        // backgroundColor: 'primary.light',
        // remove line above the accordion
        '&:before': {
          height: '0px'
        },
        '&:last-child': {
          borderBottom: '1px solid',
          borderColor: 'divider',
        }
      }}>
      <AccordionSummary
        expandIcon={
          <ExpandMoreIcon />
        }
        aria-controls={`panel1-content-${key}`}
        id={`panel1-header-${key}`}
        sx={{
          position: 'sticky',
          top: 0,
          // backgroundColor: 'primary.main',
          // padding: '0rem',
          '&:hover': {
            opacity:0.95
          }
        }}
      >
        <Badge
          badgeContent={items.length}
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              right: '-1rem',
              top: '0.25rem',
              border: '1px solid',
              borderColor: 'primary.contrastText',
              color: 'primary.contrastText',
              fontWeight: 500
            },
          }}
        >
          <div className="text-xl">{mentionType[key] ?? 'Other mentions'}</div>
        </Badge>
      </AccordionSummary>
      <AccordionDetails sx={{
        // set max height to avoid large shifts
        // maxHeight: '30rem',
        //avoid resizing when scrollbar appears
        overflow: 'overlay',
        padding: '0rem 0rem'
      }}>
        {renderMentionItemsForType(items)}
      </AccordionDetails>
    </Accordion>
  )
}

function renderMentionItemsForType(items: MentionForSoftware[]) {
  if (items.length === 0) return null
  return (
    <ul>
      {
        items.sort((a, b) => {
          // sort mentions on date, newest at the top
          return sortOnDateProp(a,b,'date','desc')
        }).map((item, pos) => {
          return (
            <li key={pos} className="p-4 hover:bg-grey-200 hover:text-black">
              <MentionItem pos={pos + 1} item={item} />
            </li>
          )
        })
      }
    </ul>
  )
}

function MentionItem({item, pos}: {item: MentionForSoftware, pos:number}) {

  function renderItemBody() {
    return (
      <div data-testid="edit-mention-item-body" className="flex justify-start">
        <div className="min-w-[1rem]">{pos}.</div>
        <div className='pl-4 flex-1'>
          <div>{item.title}</div>
          <div>{isoStrToLocalDateStr(item.date)}</div>
        </div>
        <div className="flex justify-center items-center">
          {item?.url ? <LinkIcon /> : null}
        </div>
      </div>
    )
  }

  if (item?.url) {
    return (
      <Link href={item.url} passHref>
        <a className="hover:text-black" target="_blank" rel="noreferrer">
          {renderItemBody()}
        </a>
      </Link>
    )
  }
  return renderItemBody()
}
