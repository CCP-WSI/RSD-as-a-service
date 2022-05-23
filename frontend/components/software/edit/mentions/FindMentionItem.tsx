import {mentionType, MentionTypeKeys, MentionItem} from '../../../../types/Mention'
import {isoStrToLocalDateStr} from '../../../../utils/dateFn'

export default function FindMentionItem({mention}: { mention: MentionItem }) {

  function renderDateAndAuthor() {
    if (mention.publication_year && mention.authors) {
      return (
        <>
          <div>
            {isoStrToLocalDateStr(mention.publication_year)}
          </div>
          <div className="flex-1 text-right pr-4">
            {mention.authors}
          </div>
        </>
      )
    }
    if (mention.publication_year) {
      return isoStrToLocalDateStr(mention.publication_year)
    }
    if (mention.authors) {
      return mention.authors
    }
  }

  return (
    <div>
      {mention.mention_type ?
        <div className="pr-4">
          <strong>{mentionType[mention.mention_type as MentionTypeKeys].singular}</strong>
        </div>
        :null
      }
      <div>
        {mention.title}
      </div>
      <div className="flex content-between">
        {renderDateAndAuthor()}
      </div>
      {mention.url ?
        <div>
          {mention.url}
        </div>
        :null
      }
    </div>
  )
}
