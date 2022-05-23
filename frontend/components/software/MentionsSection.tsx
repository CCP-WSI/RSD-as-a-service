import DarkThemeSection from '../layout/DarkThemeSection'

import PageContainer from '../layout/PageContainer'
import MentionIsFeatured from './MentionIsFeatured'
import MentionsByType from './MentionsByType'
import {sortOnDateProp} from '../../utils/sortFn'
import {MentionForSoftware} from '../../types/Mention'
import {clasifyMentionsByType} from '../../utils/editMentions'

export default function SoftwareMentionsSection({mentions}: { mentions: MentionForSoftware[] }) {
  // do not render section if no data
  if (!mentions || mentions.length === 0) return null
  // split to featured and (not featured) mentions by type (different presentation)
  const {mentionByType, featuredMentions} = clasifyMentionsByType(mentions)
  // console.group('SoftwareMentionsSection')
  // console.log('mentionByType...', mentionByType)
  // console.log('featuredMentions...', featuredMentions)
  // console.groupEnd()
  return (
    <DarkThemeSection>
      <PageContainer className="py-12 px-4 lg:grid lg:grid-cols-[1fr,4fr]">
        <h2
          data-testid="software-mentions-section-title"
          className="pb-8 text-[2rem] text-white">
          Mentions
        </h2>
        <section>
          {featuredMentions
            .sort((a,b)=>sortOnDateProp(a,b,'publication_year','desc'))
            .map(item => {
            return (
              <MentionIsFeatured key={item.url} mention={item} />
            )
          })}
          <MentionsByType mentionByType={mentionByType} />
        </section>
      </PageContainer>
    </DarkThemeSection>
  )
}
