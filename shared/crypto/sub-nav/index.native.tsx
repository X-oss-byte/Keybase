import * as Kb from '../../common-adapters'
import * as Styles from '../../styles'
import * as Constants from '../../constants/crypto'
import * as Container from '../../util/container'
import NavRow from './nav-row'

const CryptoSubNav = () => {
  const {navigate} = Container.useNav()
  return (
    <Kb.Box2 direction="vertical" fullWidth={true} fullHeight={true} gap="tiny" style={styles.container}>
      {Constants.Tabs.map(t => (
        <NavRow
          key={t.tab}
          tab={t.tab}
          title={t.title}
          illustration={t.illustration}
          description={t.description}
          onClick={() => navigate(t.tab as any)}
        />
      ))}
    </Kb.Box2>
  )
}

const styles = Styles.styleSheetCreate(
  () =>
    ({
      container: {
        backgroundColor: Styles.globalColors.blueGrey,
        paddingLeft: Styles.globalMargins.small,
        paddingRight: Styles.globalMargins.small,
        paddingTop: Styles.globalMargins.xsmall,
      },
    } as const)
)

export default CryptoSubNav
