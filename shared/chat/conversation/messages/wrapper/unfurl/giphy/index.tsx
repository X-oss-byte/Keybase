import * as React from 'react'
import * as Kb from '../../../../../../common-adapters/index'
import * as Styles from '../../../../../../styles'
import UnfurlImage from '../image'

export type Props = {
  imageHeight: number
  imageWidth: number
  imageURL: string
  isCollapsed: boolean
  isVideo: boolean
  faviconURL?: string
  onClose?: () => void
  onCollapse: () => void
}

const UnfurlGiphy = (props: Props) => (
  <Kb.Box2 style={styles.container} gap="tiny" direction="horizontal">
    {!Styles.isMobile && <Kb.Box2 direction="horizontal" style={styles.quoteContainer} />}
    <Kb.Box2 style={styles.innerContainer} gap="xtiny" direction="vertical">
      <Kb.Box2 style={styles.siteNameContainer} gap="tiny" fullWidth={true} direction="horizontal">
        <Kb.Box2 direction="horizontal" gap="tiny">
          {!!props.faviconURL && <Kb.Image src={props.faviconURL} style={styles.favicon} />}
          <Kb.Text type="BodySmall">Giphy</Kb.Text>
          <Kb.Icon
            boxStyle={styles.collapseBox}
            style={styles.collapse}
            onClick={props.onCollapse}
            sizeType="Tiny"
            type={props.isCollapsed ? 'iconfont-caret-right' : 'iconfont-caret-down'}
          />
        </Kb.Box2>
        {!!props.onClose && (
          <Kb.Icon
            type="iconfont-close"
            onClick={props.onClose}
            className="unfurl-closebox"
            padding="xtiny"
            fontSize={12}
          />
        )}
      </Kb.Box2>
      {!props.isCollapsed && (
        <UnfurlImage
          url={props.imageURL}
          height={props.imageHeight}
          width={props.imageWidth}
          isVideo={props.isVideo}
          autoplayVideo={true}
        />
      )}
    </Kb.Box2>
  </Kb.Box2>
)

const styles = Styles.styleSheetCreate(
  () =>
    ({
      collapse: Styles.platformStyles({
        isElectron: {
          position: 'relative',
          top: Styles.globalMargins.xxtiny,
        },
        isMobile: {
          alignSelf: 'center',
        },
      }),
      collapseBox: {
        ...Styles.globalStyles.flexBoxRow,
        alignItems: 'center',
      },
      container: Styles.platformStyles({
        common: {
          alignSelf: 'flex-start',
        },
        isElectron: {
          maxWidth: 500,
        },
      }),
      favicon: {
        borderRadius: Styles.borderRadius,
        height: 16,
        width: 16,
      },
      imageContainer: Styles.platformStyles({
        isMobile: {
          alignSelf: 'flex-start',
          padding: Styles.globalMargins.xxtiny,
        },
      }),
      innerContainer: Styles.platformStyles({
        common: {
          alignSelf: 'flex-start',
          minWidth: 150,
        },
        isMobile: {
          borderColor: Styles.globalColors.grey,
          borderRadius: Styles.borderRadius,
          borderWidth: 1,
          padding: Styles.globalMargins.xtiny,
        },
      }),
      quoteContainer: {
        alignSelf: 'stretch',
        backgroundColor: Styles.globalColors.grey,
        paddingLeft: Styles.globalMargins.xtiny,
      },
      siteNameContainer: Styles.platformStyles({
        common: {
          alignSelf: 'flex-start',
          justifyContent: 'space-between',
        },
        isMobile: {
          paddingBottom: Styles.globalMargins.xxtiny,
          paddingLeft: Styles.globalMargins.tiny,
          paddingTop: Styles.globalMargins.tiny,
        },
      }),
    } as const)
)

export default React.memo(UnfurlGiphy)
