import * as React from 'react'
import * as ConfigConstants from '../constants/config'

const Loading = React.lazy(async () => import('./loading/container'))
const Relogin = React.lazy(async () => import('./relogin/container'))
const JoinOrLogin = React.lazy(async () => import('./join-or-login/container'))

const RootLogin = () => {
  const isLoggedIn = ConfigConstants.useConfigState(s => s.loggedIn)
  const userSwitching = ConfigConstants.useConfigState(s => s.userSwitching)
  const showLoading = ConfigConstants.useDaemonState(s => s.handshakeState !== 'done' || userSwitching)
  const showRelogin = ConfigConstants.useConfigState(s => !showLoading && s.configuredAccounts.length > 0)
  // routing should switch us away so lets not draw anything to speed things up
  if (isLoggedIn) return null

  if (showLoading) {
    return (
      <React.Suspense>
        <Loading />
      </React.Suspense>
    )
  }
  if (showRelogin) {
    return (
      <React.Suspense>
        <Relogin />
      </React.Suspense>
    )
  }

  return (
    <React.Suspense>
      <JoinOrLogin />
    </React.Suspense>
  )
}

export default RootLogin
