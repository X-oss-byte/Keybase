import Box from './box'
import ClickableBox from './clickable-box'
import Icon, {type IconType} from './icon'
import Text from './text'
import * as React from 'react'
import {globalStyles, globalColors, globalMargins} from '../styles'
import type {Props} from './choice-list'

type State = {
  activeIndex?: number
}

class ChoiceList extends React.Component<Props, State> {
  state: State = {activeIndex: undefined}

  componentDidUpdate(prevProps: Props) {
    if (prevProps !== this.props) {
      this.setState({activeIndex: undefined})
    }
  }

  render() {
    const {options} = this.props
    return (
      <Box>
        {options.map((op, idx) => {
          // @ts-ignore
          const iconType: IconType = op.icon
          return (
            <ClickableBox
              key={idx}
              underlayColor={globalColors.blueLighter2}
              onClick={op.onClick}
              onPressIn={() => this.setState({activeIndex: idx})}
              onPressOut={() => this.setState({activeIndex: undefined})}
            >
              <Box style={styleEntry}>
                <Box style={styleIconContainer(this.state.activeIndex === idx)}>
                  {typeof op.icon === 'string' ? (
                    <Icon style={styleIcon} type={iconType} />
                  ) : (
                    <Box style={styleIcon}>{op.icon}</Box>
                  )}
                </Box>
                <Box style={styleInfoContainer}>
                  <Text style={styleInfoTitle} type="Header">
                    {op.title}
                  </Text>
                  <Text type="Body">{op.description}</Text>
                </Box>
              </Box>
            </ClickableBox>
          )
        })}
      </Box>
    )
  }
}

const styleEntry = {
  ...globalStyles.flexBoxRow,
  paddingBottom: globalMargins.tiny,
  paddingLeft: globalMargins.small,
  paddingRight: globalMargins.small,
  paddingTop: globalMargins.tiny,
}

const styleIconContainer = (active: boolean) => ({
  ...globalStyles.flexBoxColumn,
  alignItems: 'center',
  alignSelf: 'center',
  borderRadius: (globalMargins.large + globalMargins.medium) / 2,
  height: globalMargins.large + globalMargins.medium,
  justifyContent: 'center',
  ...(active ? {} : {backgroundColor: globalColors.greyLight}),
  width: globalMargins.large + globalMargins.medium,
})

const styleIcon = {
  height: globalMargins.large,
  width: globalMargins.large,
}

const styleInfoContainer = {
  ...globalStyles.flexBoxColumn,
  flex: 1,
  justifyContent: 'center',
  marginLeft: globalMargins.small,
}

const styleInfoTitle = {
  color: globalColors.blueDark,
}

export default ChoiceList
