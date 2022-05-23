
import {Session} from '~/auth'

import ContentLoader from '~/components/layout/ContentLoader'
import EditSection from '~/components/layout/EditSection'
import EditSectionTitle from '~/components/layout/EditSectionTitle'
import {clasifyMentionsByType} from '~/utils/editMentions'
import useProjectContext from '../useProjectContext'
import useImpactForProject from './useImpactForProject'
import DefaultMentionsByType from '../DefaultMentionsByType'

import FindMention from './FindMention'

export default function ProjectImpact({session}:{session:Session}) {
  const {project} = useProjectContext()
  const {impact, loading} = useImpactForProject({
    project: project.id,
    token: session.token
  })

  const {mentionByType} = clasifyMentionsByType(impact)

  // console.group('ProjectImpact')
  // console.log('impact...', impact)
  // console.log('mentionByType...', mentionByType)
  // console.groupEnd()

  if (loading) {
    return (
      <ContentLoader />
    )
  }


  return (
    <EditSection className='xl:grid xl:grid-cols-[1fr,1fr] xl:px-0 xl:gap-[3rem]'>
      <div className="py-4 xl:pl-[3rem]">
        <EditSectionTitle
          title="Impact"
        >
          <span>{impact.length ?? 0}</span>
        </EditSectionTitle>
        <div className="py-4"></div>
        <DefaultMentionsByType
          mentionByType={mentionByType}
        />
      </div>
      <div className="py-4 min-w-[21rem] xl:my-0">
        <FindMention />
      </div>
    </EditSection>
  )
}
