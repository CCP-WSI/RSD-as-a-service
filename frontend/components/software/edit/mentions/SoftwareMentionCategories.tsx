import {useContext} from 'react'
import Badge from '@mui/material/Badge'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'

import {mentionType, MentionType, MentionTypeKeys} from '../../../../types/Mention'
import mentionCountContext from './MentionCountContext'

export default function SoftwareMentionCategories({category,onCategoryChange}:
  {category:MentionTypeKeys,onCategoryChange:(category:MentionTypeKeys) => void}) {
  const {mentionCount} = useContext(mentionCountContext)

  function getBadgeContent(key: MentionTypeKeys) {
    if (mentionCount && mentionCount[key]) {
      return mentionCount[key]
    }
    return 0
  }

  return (
    <List sx={{
      width:['100%']
    }}>
      {Object.keys(mentionCount ?? {}).map((key: string, pos:number) => {
        return (
          <ListItemButton
            key={`step-${pos}`}
            selected={key === category}
            onClick={() => {
              onCategoryChange(key as MentionTypeKeys)
            }}
            sx={{
              padding:'0.5rem 1.5rem 0.5rem 0.5rem'
            }}
          >
            <ListItemText
              primary={
                <span>{mentionType[key as MentionTypeKeys].plural}</span>
              }
              // secondary={`${items?.length ?? 0} items`}
            />
            <Badge
              showZero={false}
              badgeContent={getBadgeContent(key as MentionTypeKeys)}
              color="primary"
              sx={{
                '& .MuiBadge-badge': {
                  right: '-0.5rem',
                  top: '-0.5rem'
                },
              }}
              ></Badge>
          </ListItemButton>
        )
      })}
    </List>
  )
}
