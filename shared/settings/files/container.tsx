import Files, {defaultNotificationThreshold, allowedNotificationThresholds} from '.'
import * as Constants from '../../constants/fs'
import * as FsGen from '../../actions/fs-gen'
import * as RouteTreeGen from '../../actions/route-tree-gen'
import * as Container from '../../util/container'
import {isMobile} from '../../constants/platform'
import type {PickerItem} from '../../common-adapters/floating-picker'

const SettingsFiles = () => {
  const areSettingsLoading = Constants.useState(s => s.settings.isLoading)
  const driverStatus = Constants.useState(s => s.sfmi.driverStatus)
  const spaceAvailableNotificationThreshold = Constants.useState(
    s => s.settings.spaceAvailableNotificationThreshold
  )

  const dispatch = Container.useDispatch()
  const onBack = isMobile
    ? () => {
        dispatch(RouteTreeGen.createNavigateUp())
      }
    : undefined
  const onDisable = () => {
    dispatch(FsGen.createDriverDisable())
  }
  const onDisableSyncNotifications = () => {
    dispatch(FsGen.createSetSpaceAvailableNotificationThreshold({spaceAvailableNotificationThreshold: 0}))
  }
  const onEnable = () => {
    dispatch(FsGen.createDriverEnable({}))
  }
  const onSetSyncNotificationThreshold = (threshold: number) => {
    dispatch(
      FsGen.createSetSpaceAvailableNotificationThreshold({spaceAvailableNotificationThreshold: threshold})
    )
  }
  const onShowKextPermissionPopup = () => {
    dispatch(RouteTreeGen.createNavigateAppend({path: ['kextPermission']}))
  }
  const props = {
    allowedThresholds: allowedNotificationThresholds.map(
      i =>
        ({
          label: Constants.humanizeBytes(i, 0),
          value: i,
        } as PickerItem<number>)
    ),
    areSettingsLoading,
    driverStatus,
    humanizedNotificationThreshold: Constants.humanizeBytes(
      spaceAvailableNotificationThreshold || defaultNotificationThreshold,
      0
    ),
    onBack,
    onChangedSyncNotifications: (selectedIdx: number) =>
      onSetSyncNotificationThreshold(allowedNotificationThresholds[selectedIdx] ?? 0),
    onDisable,
    onDisableSyncNotifications,
    onEnable,
    onEnableSyncNotifications: () => onSetSyncNotificationThreshold(defaultNotificationThreshold),
    onSetSyncNotificationThreshold,
    onShowKextPermissionPopup,
    spaceAvailableNotificationThreshold,
  }
  return <Files {...props} />
}

export default SettingsFiles
