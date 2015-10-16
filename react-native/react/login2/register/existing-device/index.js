'use strict'
/* @flow */

import React, { Component, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import commonStyles from '../../../styles/common'
import { navigateUp, routeAppend } from '../../../actions/router'
import { setCodePageRoles } from '../../../actions/login2'
import CodePage from '../code-page'
import { codePageRoleExistingPhone, codePageRoleNewPhone, codePageRoleExistingComputer } from '../../../constants/login2'

export default class ExistingDevice extends Component {
  showCodePage (myRole, otherRole) {
    this.props.dispatch(setCodePageRoles(myRole, otherRole))
    this.props.dispatch(routeAppend('codePage'))
  }

  render () {
    return (
      <View style={[styles.container, {marginTop: 200, padding: 20, alignItems: 'stretch'}]}>
        <Text style={commonStyles.h1}>What type of device would you like to connect this device with?</Text>
        <View style={{flex: 1, flexDirection: 'row', marginTop: 40, justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: 40, paddingRight: 40}}>
          <TouchableHighlight onPress={() => this.showCodePage(codePageRoleNewPhone, codePageRoleExistingComputer)}>
            <View style={{flexDirection: 'column', alignItems: 'center'}}>
              <Text>[Desktop icon]</Text>
              <Text>Desktop Device &gt;</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => this.showCodePage(codePageRoleNewPhone, codePageRoleExistingPhone)}>
            <View style={{flexDirection: 'column', alignItems: 'center'}}>
              <Text>[Mobile icon]</Text>
              <Text>Mobile Device &gt;</Text>
            </View>
          </TouchableHighlight>
        </View>
        <Text onPress={() => this.props.dispatch(navigateUp())} style={{alignSelf: 'flex-end'}}>Back</Text>
      </View>
    )
  }

  static parseRoute (store, currentPath, nextPath) {
    return {
      componentAtTop: {
        mapStateToProps: state => state.login2
      },
      subRoutes: {
        codePage: CodePage
      }
    }
  }
}

ExistingDevice.propTypes = {
  dispatch: React.PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start'
  }
})
