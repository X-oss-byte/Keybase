import * as RouteTreeGen from '../../actions/route-tree-gen'
import * as Container from '../../util/container'
import * as Constants from '../../constants/settings'
import {ProxySettings as ProxySettingsComponent, ProxySettingsPopup} from '.'

const useConnect = () => {
  const allowTlsMitmToggle = Constants.useState(s => s.didToggleCertificatePinning)
  const setDidToggleCertificatePinning = Constants.useState(s => s.dispatch.setDidToggleCertificatePinning)
  const proxyData = Constants.useState(s => s.proxyData)
  const saveProxyData = Constants.useState(s => s.dispatch.setProxyData)
  const loadProxyData = Constants.useState(s => s.dispatch.loadProxyData)

  const dispatch = Container.useDispatch()
  const resetCertPinningToggle = () => {
    setDidToggleCertificatePinning()
  }
  const onBack = () => {
    dispatch(RouteTreeGen.createNavigateAppend({path: ['login']}))
  }
  const onDisableCertPinning = () => {
    dispatch(RouteTreeGen.createNavigateAppend({path: ['disableCertPinningModal']}))
  }
  const onEnableCertPinning = () => {
    setDidToggleCertificatePinning(false)
  }
  const props = {
    allowTlsMitmToggle,
    loadProxyData,
    onBack,
    onDisableCertPinning,
    onEnableCertPinning,
    proxyData,
    resetCertPinningToggle,
    saveProxyData,
  }

  return props
}

// Export the popup as the default export so it is easy to make a route pointing to it
export default () => {
  const props = useConnect()
  return <ProxySettingsPopup {...props} />
}

// The proxy settings component used in the advanced settings screen
const ProxySettings = () => {
  const props = useConnect()
  return <ProxySettingsComponent {...props} />
}
export {ProxySettings}
