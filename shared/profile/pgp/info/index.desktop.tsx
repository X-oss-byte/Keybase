import * as Kb from '../../../common-adapters'
import * as Styles from '../../../styles'
import * as RouteTreeGen from '../../../actions/route-tree-gen'
import * as Container from '../../../util/container'
import * as Constants from '../../../constants/profile'
import Modal from '../../modal'
import shallowEqual from 'shallowequal'

const Info = () => {
  const updatePgpInfo = Constants.useState(s => s.dispatch.updatePgpInfo)
  const generatePgp = Constants.useState(s => s.dispatch.generatePgp)
  const data = Constants.useState(s => {
    const {pgpEmail1, pgpEmail2, pgpEmail3, pgpErrorText, pgpFullName} = s
    const {pgpErrorEmail1, pgpErrorEmail2, pgpErrorEmail3} = s
    return {
      pgpEmail1,
      pgpEmail2,
      pgpEmail3,
      pgpErrorEmail1,
      pgpErrorEmail2,
      pgpErrorEmail3,
      pgpErrorText,
      pgpFullName,
    }
  }, shallowEqual)

  const dispatch = Container.useDispatch()
  const onCancel = () => dispatch(RouteTreeGen.createNavigateUp())
  const onChangeEmail1 = (pgpEmail1: string) => updatePgpInfo({pgpEmail1})
  const onChangeEmail2 = (pgpEmail2: string) => updatePgpInfo({pgpEmail2})
  const onChangeEmail3 = (pgpEmail3: string) => updatePgpInfo({pgpEmail3})
  const onChangeFullName = (pgpFullName: string) => updatePgpInfo({pgpFullName})
  const onNext = () => generatePgp()
  const nextDisabled = !data.pgpEmail1 || !data.pgpFullName || !!data.pgpErrorText
  return (
    <Modal onCancel={onCancel} skipButton={true}>
      <Kb.Box2 direction="vertical" fullWidth={true} gap="tiny" style={styles.content}>
        <Kb.PlatformIcon platform="pgp" overlay="icon-proof-unfinished" style={styles.centered} />
        <Kb.Text type="BodySemibold" style={styles.centered}>
          Fill in your public info.
        </Kb.Text>
        <Kb.LabeledInput
          autoFocus={true}
          placeholder="Your full name"
          value={data.pgpFullName}
          onChangeText={onChangeFullName}
        />
        <Kb.LabeledInput
          placeholder="Email 1"
          onChangeText={onChangeEmail1}
          onEnterKeyDown={onNext}
          value={data.pgpEmail1}
          error={data.pgpErrorEmail1}
        />
        <Kb.LabeledInput
          placeholder="Email 2 (optional)"
          onChangeText={onChangeEmail2}
          onEnterKeyDown={onNext}
          value={data.pgpEmail2}
          error={data.pgpErrorEmail2}
        />
        <Kb.LabeledInput
          placeholder="Email 3 (optional)"
          onChangeText={onChangeEmail3}
          onEnterKeyDown={onNext}
          value={data.pgpEmail3}
          error={data.pgpErrorEmail3}
        />
        <Kb.Text type={data.pgpErrorText ? 'BodySmallError' : 'BodySmall'}>
          {data.pgpErrorText || 'Include any addresses you plan to use for PGP encrypted email.'}
        </Kb.Text>
      </Kb.Box2>
      <Kb.Box2 fullWidth={true} direction="horizontal" gap="small">
        <Kb.Button type="Dim" label="Cancel" onClick={onCancel} />
        <Kb.Button label="Let the math begin" disabled={nextDisabled} onClick={onNext} style={styles.math} />
      </Kb.Box2>
    </Modal>
  )
}

const styles = Styles.styleSheetCreate(
  () =>
    ({
      centered: {alignSelf: 'center'},
      content: {flexGrow: 1},
      math: {flexGrow: 1},
    } as const)
)
export default Info
