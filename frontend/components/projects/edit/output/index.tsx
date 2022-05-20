
import {Session} from '~/auth'
import ContentLoader from '~/components/layout/ContentLoader'
import EditSection from '~/components/layout/EditSection'
import EditSectionTitle from '~/components/layout/EditSectionTitle'
import {clasifyMentionsByType} from '~/utils/editMentions'
import DefaultMentionsByType from '../DefaultMentionsByType'
import useProjectContext from '../useProjectContext'
import useOutputForProject from './useOutputForProject'

export default function ProjectOutput({session}:{session:Session}) {
  const {project} = useProjectContext()
  const {output, loading} = useOutputForProject({
    project: project.id,
    token: session.token
  })

  const {mentionByType} = clasifyMentionsByType(output)

  if (loading) {
    return (
      <ContentLoader />
    )
  }

  return (
    <EditSection className='xl:grid xl:grid-cols-[3fr,1fr] xl:px-0 xl:gap-[3rem]'>
      <div className="py-4 xl:pl-[3rem]">
        <EditSectionTitle
          title="Output"
        />
        <div className="py-4"></div>
        <DefaultMentionsByType
          mentionByType={mentionByType}
        />
      </div>
      <div className="py-4 min-w-[21rem] xl:my-0">
        <h2>Find mention</h2>
      </div>
    </EditSection>
  )
}
