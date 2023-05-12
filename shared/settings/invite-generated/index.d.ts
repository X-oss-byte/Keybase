import {Component} from 'react'

export type Props = {
  email?: string
  link: string
  onClose: () => void
}

export default class InviteGenerated extends Component<Props> {}
export class InviteGeneratedRender extends Component<Props> {}
