'use strict'

import * as Constants from '../constants/login2'
import Immutable from 'immutable'

const initialState = {
  username: '',
  passphrase: '',
  codePage: {
    otherRole: Constants.codePageRoleExistingComputer,
    myRole: Constants.codePageRoleNewPhone,
    mode: Constants.codePageModeScanCode,
    codeCountDown: 0,
    textCode: null,
    qrScanned: null,
    qrCode: null
  }
}

export default function (state = initialState, action) {
  switch (action.type) {
    case Constants.actionSubmitUserPass:
      return {
        ...state,
        username: action.username,
        passphrase: action.passphrase
      }
    case Constants.setCodeState: {
      const s = Immutable.fromJS(state)
      return s.mergeDeep({
        codePage: {
          myRole: action.myRole,
          otherRole: action.otherRole
        }
      }).toJS()
    }
    case Constants.setCodeMode: {
      const s = Immutable.fromJS(state)
      return s.mergeDeep({
        codePage: {
          mode: action.mode
        }
      }).toJS()
    }
    case Constants.setCountdown: {
      const s = Immutable.fromJS(state)
      return s.mergeDeep({
        codePage: {
          codeCountDown: action.countDown
        }
      }).toJS()
    }
    case Constants.setTextCode: {
      const s = Immutable.fromJS(state)
      return s.mergeDeep({
        codePage: {
          textCode: action.text
        }
      }).toJS()
    }
    case Constants.qrGenerate: {
      const s = Immutable.fromJS(state)
      return s.mergeDeep({
        codePage: {
          qrCode: null
        }
      }).toJS()
    }
    case Constants.qrGenerated: {
      const s = Immutable.fromJS(state)
      return s.mergeDeep({
        codePage: {
          qrCode: action.qrCode
        }
      }).toJS()
    }
    case Constants.qrScanned: {
      const s = Immutable.fromJS(state)
      return s.mergeDeep({
        codePage: {
          qrScanned: action.code
        }
      }).toJS()
    }
    default:
      return state
  }
}
