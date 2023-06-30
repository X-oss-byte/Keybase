// This hook sends props to a remote window
// Listens for requests from the main process (which proxies requests from other windows) to kick off an update
// If asked we'll send all props, otherwise we do a shallow compare and send the different ones
import * as React from 'react'
import * as ConfigConstants from '../../constants/config'
import throttle from 'lodash/throttle'
import KB2 from '../../util/electron.desktop'

const {rendererNewProps} = KB2.functions

// set this to true to see details of the serialization process
const debugSerializer = __DEV__ && false
if (debugSerializer) {
  console.log('\n\n\n\n\n\nDEBUGGING REMOTE SERIALIZER')
}

export default function useSerializeProps<ProxyProps extends {}, SerializeProps extends {}>(
  p: ProxyProps,
  serializer: (p: ProxyProps) => Partial<SerializeProps>,
  windowComponent: string,
  windowParam: string
) {
  const lastSent = React.useRef<Partial<SerializeProps>>({})
  const lastForceUpdate = React.useRef<number>(-1)
  const currentForceUpdate = ConfigConstants.useConfigState(
    s => s.remoteWindowNeedsProps.get(windowComponent)?.get(windowParam) ?? 0
  )

  const throttledSend = React.useRef(
    throttle(
      (p: ProxyProps, forceUpdate: boolean) => {
        const lastToSend = forceUpdate ? {} : lastSent.current
        const serialized = serializer(p)
        const toSend = {...serialized}
        // clear undefineds / exact dupes
        Object.keys(toSend).forEach(k => {
          // @ts-ignore
          if (toSend[k] === undefined || JSON.stringify(toSend[k]) === JSON.stringify(lastToSend?.[k])) {
            // @ts-ignore
            delete toSend[k]
          }
        })

        if (Object.keys(toSend).length) {
          const propsStr = JSON.stringify(toSend)
          debugSerializer && console.log('[useSerializeProps]: throttled send', propsStr.length, toSend)
          rendererNewProps?.({propsStr, windowComponent, windowParam})
        }
        lastSent.current = serialized
        lastForceUpdate.current = currentForceUpdate
      },
      1000,
      {leading: true}
    )
  )

  React.useEffect(
    () => {
      if (!windowComponent) {
        return
      }
      const forceUpdate = currentForceUpdate !== lastForceUpdate.current
      throttledSend.current(p, forceUpdate)
    },
    // eslint-disable-next-line
    [...Object.values(p), currentForceUpdate]
  )
}
