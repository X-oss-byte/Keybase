import * as Container from '../../../util/container'
import * as Constants from '../../../constants/profile'
import * as RouteTreeGen from '../../../actions/route-tree-gen'
import openURL from '../../../util/open-url'
import EnterUsername from '.'
import shallowEqual from 'shallowequal'

const ConnectedEnterUsername = () => {
  const {platformGenericChecking, platformGenericParams, platformGenericURL, username} = Constants.useState(
    s => {
      const {platformGenericChecking, platformGenericParams, platformGenericURL, username} = s
      return {platformGenericChecking, platformGenericParams, platformGenericURL, username}
    },
    shallowEqual
  )
  const errorText = Constants.useState(s => s.errorText)
  const _platformURL = platformGenericURL
  const error = errorText
  const serviceIcon = platformGenericParams?.logoBlack ?? []
  const serviceIconFull = platformGenericParams?.logoFull ?? []
  const serviceName = platformGenericParams?.title ?? ''
  const serviceSub = platformGenericParams?.subtext ?? ''
  const serviceSuffix = platformGenericParams?.suffix ?? ''
  const submitButtonLabel = platformGenericParams?.buttonLabel ?? 'Submit'
  const unreachable = !!platformGenericURL
  const waiting = platformGenericChecking

  const cancelAddProof = Constants.useState(s => s.dispatch.cancelAddProof)
  const updateUsername = Constants.useState(s => s.dispatch.updateUsername)
  const submitUsername = Constants.useState(s => s.dispatch.submitUsername)

  const dispatch = Container.useDispatch()
  const onBack = () => {
    cancelAddProof()
    dispatch(RouteTreeGen.createClearModals())
  }
  const onChangeUsername = updateUsername
  const onContinue = () => {
    dispatch(RouteTreeGen.createNavigateAppend({path: ['profileGenericProofResult']}))
  }
  const onSubmit = submitUsername
  const props = {
    error: error,
    onBack: onBack,
    onCancel: onBack,
    onChangeUsername: onChangeUsername,
    onContinue: onContinue,
    onSubmit: _platformURL ? () => _platformURL && openURL(_platformURL) : onSubmit,
    serviceIcon: serviceIcon,
    serviceIconFull: serviceIconFull,
    serviceName: serviceName,
    serviceSub: serviceSub,
    serviceSuffix: serviceSuffix,
    submitButtonLabel: submitButtonLabel,
    unreachable: unreachable,
    username: username,
    waiting: waiting,
  }
  return <EnterUsername {...props} />
}
export default ConnectedEnterUsername
