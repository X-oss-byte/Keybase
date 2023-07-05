import * as Container from '../../util/container'
import * as Kb from '../../common-adapters'
import * as RPCTypes from '../../constants/types/rpc-gen'
import * as Constants from '../../constants/recover-password'
import * as RouteTreeGen from '../../actions/route-tree-gen'
import type {ButtonType} from '../../common-adapters/button'
import {SignupScreen} from '../../signup/common'
import {globalColors} from '../../styles'

const ConnectedExplainDevice = () => {
  const ed = Constants.useState(s => s.explainedDevice)
  const deviceName = ed ? ed.name : ''
  const deviceType = ed ? ed.type : undefined
  const username = Constants.useState(s => s.username)
  const startRecoverPassword = Constants.useState(s => s.dispatch.startRecoverPassword)
  const dispatch = Container.useDispatch()
  const onBack = () => {
    startRecoverPassword({
      replaceRoute: true,
      username,
    })
  }
  const onComplete = () => {
    dispatch(RouteTreeGen.createNavigateUp())
  }
  const props = {
    deviceName,
    deviceType,
    onBack,
    onComplete,
    username,
  }
  return <ExplainDevice {...props} />
}

export default ConnectedExplainDevice

export type Props = {
  deviceName: string
  deviceType?: RPCTypes.DeviceType
  onBack: () => void
  onComplete: () => void
}

const ExplainDevice = (props: Props) => {
  const explainingMobile = props.deviceType === RPCTypes.DeviceType.mobile

  return (
    <SignupScreen
      buttons={[
        {
          label: 'Got it',
          onClick: props.onComplete,
          type: 'Default' as ButtonType,
        },
      ]}
      noBackground={true}
      onBack={props.onBack}
      title="Recover password"
    >
      <Kb.Box2 alignItems="center" direction="vertical" fullHeight={true} fullWidth={true} gap="small">
        <Kb.Icon type={explainingMobile ? 'icon-phone-96' : 'icon-computer-96'} />
        <Kb.Box2 alignItems="center" direction="vertical">
          <Kb.Text type="Body">
            On <Kb.Text type="BodySemiboldItalic">{props.deviceName}</Kb.Text>, go to
          </Kb.Text>
          <Kb.Box2 direction="horizontal" alignItems="center" gap="xtiny">
            {explainingMobile ? (
              <Kb.Icon type="iconfont-nav-2-hamburger" color={globalColors.black} />
            ) : (
              <Kb.Text type="Body">Settings</Kb.Text>
            )}
            <Kb.Text type="Body">{`> Your account, and change your`}</Kb.Text>
          </Kb.Box2>
          <Kb.Text type="Body">password.</Kb.Text>
        </Kb.Box2>
      </Kb.Box2>
    </SignupScreen>
  )
}
