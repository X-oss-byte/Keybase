import * as Types from '../../../constants/types/fs'
import * as React from 'react'
import * as Constants from '../../../constants/fs'
import * as ConfigConstants from '../../../constants/config'
import * as FsGen from '../../../actions/fs-gen'
import * as Chat2Gen from '../../../actions/chat2-gen'
import * as Container from '../../../util/container'
import {isMobile} from '../../../constants/platform'
import {memoize} from '../../../util/memoize'
import Menu from './menu'
import type {FloatingMenuProps} from './types'
import {getRootLayout, getShareLayout} from './layout'
import * as RouteTreeGen from '../../../actions/route-tree-gen'
import * as Util from '../../../util/kbfs'

type OwnProps = {
  floatingMenuProps: FloatingMenuProps
  path: Types.Path
  mode: 'row' | 'screen'
}

const needConfirm = (pathItem: Types.PathItem) =>
  pathItem.type === Types.PathType.File && pathItem.size > 50 * 1024 * 1024

const getDownloadingState = memoize(
  (
    downloads: Types.Downloads,
    downloadID: string | undefined,
    pathItemActionMenu: Types.PathItemActionMenu
  ) => {
    if (!downloadID) {
      return {done: true, saving: false, sharing: false}
    }
    const downloadState = downloads.state.get(downloadID) || Constants.emptyDownloadState
    const intent = pathItemActionMenu.downloadIntent
    const done = downloadState !== Constants.emptyDownloadState && !Constants.downloadIsOngoing(downloadState)
    if (!intent) {
      return {done, saving: false, sharing: false}
    }
    return {
      done,
      saving: intent === Types.DownloadIntent.CameraRoll,
      sharing: intent === Types.DownloadIntent.Share,
    }
  }
)

const addCancelIfNeeded = (action: () => void, cancel: (arg0: string) => void, toCancel?: string) =>
  toCancel
    ? () => {
        action()
        cancel(toCancel)
      }
    : action

export default (ownProps: OwnProps) => {
  const {path, mode} = ownProps

  const _downloadID = Container.useSelector(state => state.fs.pathItemActionMenu.downloadID)
  const _downloads = Container.useSelector(state => state.fs.downloads)
  const _fileContext = Container.useSelector(
    state => state.fs.fileContext.get(path) || Constants.emptyFileContext
  )
  const _ignoreNeedsToWait = Container.useAnyWaiting([
    Constants.folderListWaitingKey,
    Constants.statWaitingKey,
  ])
  const _pathItem = Container.useSelector(state => Constants.getPathItem(state.fs.pathItems, path))
  const _pathItemActionMenu = Container.useSelector(state => state.fs.pathItemActionMenu)
  const _sfmiEnabled = Container.useSelector(
    state => state.fs.sfmi.driverStatus.type === Types.DriverStatusType.Enabled
  )
  const _username = ConfigConstants.useCurrentUserState(s => s.username)
  const _view = Container.useSelector(state => state.fs.pathItemActionMenu.view)

  const dispatch = Container.useDispatch()

  const _cancel = React.useCallback(
    (downloadID: string) => {
      dispatch(FsGen.createCancelDownload({downloadID}))
    },
    [dispatch]
  )
  const _confirmSaveMedia = React.useCallback(() => {
    dispatch(FsGen.createSetPathItemActionMenuView({view: Types.PathItemActionMenuView.ConfirmSaveMedia}))
  }, [dispatch])
  const _confirmSendToOtherApp = React.useCallback(() => {
    dispatch(
      FsGen.createSetPathItemActionMenuView({view: Types.PathItemActionMenuView.ConfirmSendToOtherApp})
    )
  }, [dispatch])
  const _delete = () => {
    dispatch(
      RouteTreeGen.createNavigateAppend({
        path: [{props: {mode, path}, selected: 'confirmDelete'}],
      })
    )
  }
  const _download = React.useCallback(() => {
    dispatch(FsGen.createDownload({path}))
  }, [dispatch, path])
  const _ignoreTlf = React.useCallback(() => {
    dispatch(FsGen.createFavoriteIgnore({path}))
  }, [dispatch, path])
  const _newFolder = React.useCallback(() => {
    dispatch(FsGen.createNewFolderRow({parentPath: path}))
  }, [dispatch, path])
  const _openChat = () => {
    dispatch(
      Chat2Gen.createPreviewConversation({
        reason: 'files',
        // tlfToParticipantsOrTeamname will route both public and private
        // folders to a private chat, which is exactly what we want.
        ...Util.tlfToParticipantsOrTeamname(Types.pathToString(path)),
      })
    )
  }
  const _rename = React.useCallback(() => {
    dispatch(FsGen.createStartRename({path}))
  }, [dispatch, path])
  const _saveMedia = React.useCallback(() => {
    dispatch(FsGen.createSaveMedia({path}))
  }, [dispatch, path])
  const _sendAttachmentToChat = () => {
    path &&
      dispatch(
        RouteTreeGen.createNavigateAppend({
          path: [{props: {sendPaths: [path]}, selected: 'sendToChat'}],
        })
      )
  }
  const _sendToOtherApp = React.useCallback(() => {
    dispatch(FsGen.createShareNative({path}))
  }, [dispatch, path])
  const _share = React.useCallback(() => {
    dispatch(FsGen.createSetPathItemActionMenuView({view: Types.PathItemActionMenuView.Share}))
  }, [dispatch])
  const _showInSystemFileManager = React.useCallback(() => {
    dispatch(FsGen.createOpenPathInSystemFileManager({path}))
  }, [dispatch, path])

  const getLayout = _view === 'share' ? getShareLayout : getRootLayout
  const layout = getLayout(mode, ownProps.path, _pathItem, _fileContext, _username)
  const c = action => (isMobile ? addCancelIfNeeded(action, _cancel, _downloadID) : action)

  const getSendToOtherApp = () => {
    const {sharing} = getDownloadingState(_downloads, _downloadID, _pathItemActionMenu)
    if (sharing) {
      return 'in-progress'
    } else {
      return needConfirm(_pathItem) ? c(_confirmSendToOtherApp) : c(_sendToOtherApp)
    }
  }

  const getSaveMedia = () => {
    const {saving} = getDownloadingState(_downloads, _downloadID, _pathItemActionMenu)
    if (saving) {
      return 'in-progress'
    } else {
      return needConfirm(_pathItem) ? c(_confirmSaveMedia) : c(_saveMedia)
    }
  }

  const props = {
    ...ownProps,
    delete: layout.delete ? c(_delete) : undefined,
    download: layout.download ? c(_download) : undefined,
    ignoreTlf: layout.ignoreTlf ? (_ignoreNeedsToWait ? 'disabled' : c(_ignoreTlf)) : undefined,
    me: _username,
    moveOrCopy: undefined,
    newFolder: layout.newFolder ? c(_newFolder) : undefined,
    openChatNonTeam: layout.openChatNonTeam ? c(_openChat) : undefined,
    openChatTeam: layout.openChatTeam ? c(_openChat) : undefined,
    pathItemType: _pathItem.type,
    rename: layout.rename ? c(_rename) : undefined,
    saveMedia: layout.saveMedia ? getSaveMedia() : undefined,
    sendAttachmentToChat: layout.sendAttachmentToChat ? c(_sendAttachmentToChat) : undefined, // TODO
    sendToOtherApp: layout.sendToOtherApp ? getSendToOtherApp() : undefined,
    share: layout.share ? _share : undefined,
    showInSystemFileManager:
      layout.showInSystemFileManager && _sfmiEnabled ? c(_showInSystemFileManager) : undefined,
  }
  return <Menu {...props} />
}
