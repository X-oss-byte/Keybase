import * as ConfigGen from '../actions/config-gen'
import * as Styles from '../styles'
import * as DeeplinksGen from '../actions/deeplinks-gen'
import * as WaitingConstants from '../constants/waiting'
import * as React from 'react'
import * as DarkMode from '../constants/darkmode'
import {chatDebugEnabled} from '../constants/chat2/debug'
import Main from './main.native'
import makeStore from '../store/configure-store'
import {AppRegistry, AppState, Appearance, Linking, Keyboard} from 'react-native'
import {PortalProvider} from '../common-adapters/portal.native'
import {Provider, useDispatch} from 'react-redux'
import {SafeAreaProvider, initialWindowMetrics} from 'react-native-safe-area-context'
import {makeEngine} from '../engine'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {enableFreeze} from 'react-native-screens'
import {setKeyboardUp} from '../styles/keyboard-state'
enableFreeze(true)

type ConfigureStore = ReturnType<typeof makeStore>
let _store: ConfigureStore | undefined

module.hot?.accept(() => {
  console.log('accepted update in shared/index.native')
})

const ReduxHelper = (p: {children: React.ReactNode}) => {
  const {children} = p
  const dispatch = useDispatch()
  const appStateRef = React.useRef('active')
  const {setSystemDarkMode} = DarkMode.useDarkModeState.getState().dispatch
  React.useEffect(() => {
    const appStateChangeSub = AppState.addEventListener('change', nextAppState => {
      appStateRef.current = nextAppState
      nextAppState !== 'unknown' &&
        nextAppState !== 'extension' &&
        dispatch(ConfigGen.createMobileAppState({nextAppState}))

      if (nextAppState === 'active') {
        setSystemDarkMode(Appearance.getColorScheme() === 'dark')
      }
    })

    // only watch dark changes if in foreground due to ios calling this to take snapshots
    const darkSub = Appearance.addChangeListener(() => {
      if (appStateRef.current === 'active') {
        setSystemDarkMode(Appearance.getColorScheme() === 'dark')
      }
    })
    const linkingSub = Linking.addEventListener('url', ({url}: {url: string}) => {
      dispatch(DeeplinksGen.createLink({link: url}))
    })

    const kbSubWS = Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardUp(true)
    })
    const kbSubDS = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardUp(true)
    })
    const kbSubWH = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardUp(false)
    })
    const kbSubDH = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardUp(false)
    })

    return () => {
      appStateChangeSub.remove()
      darkSub.remove()
      linkingSub.remove()
      kbSubWS.remove()
      kbSubDS.remove()
      kbSubWH.remove()
      kbSubDH.remove()
    }
  }, [dispatch])

  const darkMode = DarkMode.useDarkModeState(s => s.isDarkMode())
  return <Styles.DarkModeContext.Provider value={darkMode}>{children}</Styles.DarkModeContext.Provider>
}

// dont' remake engine/store on reload
if (__DEV__ && !globalThis.madeEngine) {
  globalThis.madeEngine = false
}

const ensureStore = () => {
  if (__DEV__) {
    if (globalThis.madeEngine) {
      _store = global.DEBUGStore
      return
    }
    globalThis.madeEngine = true
  }
  if (_store) {
    return
  }
  _store = makeStore()
  if (__DEV__ || chatDebugEnabled) {
    global.DEBUGStore = _store
  }

  const {batch} = WaitingConstants.useWaitingState.getState().dispatch
  const eng = makeEngine(_store.store.dispatch, batch)
  _store.initListeners()
  eng.listenersAreReady()

  // On mobile there is no installer
  _store.store.dispatch(ConfigGen.createInstallerRan())
}

// on android this can be recreated a bunch so our engine/store / etc should live outside
const Keybase = () => {
  ensureStore()

  if (!_store) return null // never happens

  // reanimated still isn't compatible yet with strict mode
  // <React.StrictMode>
  // </React.StrictMode>
  return (
    <GestureHandlerRootView style={styles.gesture}>
      <Provider store={_store.store}>
        <PortalProvider>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <ReduxHelper>
              <Styles.CanFixOverdrawContext.Provider value={true}>
                <Main />
              </Styles.CanFixOverdrawContext.Provider>
            </ReduxHelper>
          </SafeAreaProvider>
        </PortalProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}

const styles = Styles.styleSheetCreate(() => ({
  gesture: {flexGrow: 1},
}))

function load() {
  AppRegistry.registerComponent('Keybase', () => Keybase)
}

export {load}
