import {useState} from 'react'

import {ListItem, ListItemText} from '@mui/material'
import List from '@mui/material/List'

import {
  extractMentionFromDoi,
  findPublicationByTitle
} from './findMentionApi'
import InputSelector, {InputAction} from './InputSelector'
import ContentLoader from '~/components/layout/ContentLoader'
import logger from '~/utils/logger'
import {MentionItem, mentionType} from '~/types/Mention'

export default function FindMention() {
  const [mention, setMention] = useState<MentionItem>()
  const [publications, setPublications] = useState<MentionItem[]>([])
  const [actionType, setActionType] = useState<string>()
  const [loading, setLoading] = useState(false)

  async function onSearchAction(action: InputAction) {
    setLoading(true)
    switch (action.type) {
      case 'doi':
        const mention = await extractMentionFromDoi(action.value)
        setMention(mention as MentionItem)
        setActionType(action.type)
        setLoading(false)
        break
      case 'title':
        const publications = await findPublicationByTitle(action.value)
        setPublications(publications as MentionItem[])
        setActionType(action.type)
        setLoading(false)
        break
      default:
        logger(`Action type not implemented...${action.type}`,'warn')
    }
  }

  function renderResponse() {
    if (loading) {
      return <ContentLoader />
    }
    if (actionType==='doi') {
      return (
        <div>
          <pre>
            {JSON.stringify(mention,null,2)}
          </pre>
        </div>
      )
    }
    if (publications.length > 0) {
      return renderList()
    }
  }

  function renderList() {
    return (
      <List
        sx={{
          maxHeight: '30rem',
          overflow: 'auto'
        }}
      >
        {publications.map(item => {
          return (
             <ListItem key={item.doi}>
              <ListItemText
                primary={
                  <div className="flex justify-between">
                    <a href={item.url ?? ''} target="_blank" rel="noreferrer">{item.title}</a>
                    <span className="pl-4 text-grey-500">{item.source}</span>
                  </div>
                }
                secondary={
                  <span className="flex justify-between">
                    <div>
                      <span>{mentionType[item.mention_type].singular}</span> DOI:<span>{item.doi}</span>
                    </div>
                    <div className="pl-4 text-right">
                      <span>{item.publisher}</span>, <span>{item.publication_year}</span>
                    </div>
                  </span>
                } />
            </ListItem>
          )
        })}
      </List>
    )
  }

  return (
    <>
      <h2>Find publications</h2>
      <InputSelector onStartAction={onSearchAction} />
      <div>
        {renderResponse()}
      </div>
    </>
  )
}
