// @ts-ignore
import prettier from 'prettier'
import path from 'path'
import json5 from 'json5'
import fs from 'fs'

type ActionNS = string
type ActionName = string
type ActionDesc = {[K in string]: string | Array<string>}
type Actions = {[K in ActionName]: ActionDesc}

type FileDesc = {
  prelude: Array<string>
  actions: Actions
}

type CompileActionFn = (ns: ActionNS, actionName: ActionName, desc: ActionDesc) => string

const reservedPayloadKeys = ['_description']
const typeMap: Array<string> = []
const cleanName = (c: string) => c.replace(/-/g, '')

const payloadHasType = (payload: ActionDesc, toFind: RegExp) => {
  return Object.keys(payload).some(param => {
    const ps = payload[param]
    if (Array.isArray(ps)) {
      return ps.some(p => toFind.exec(p))
    } else {
      return toFind.exec(ps ?? '')
    }
  })
}
const actionHasType = (actions: Actions, toFind: RegExp) =>
  // @ts-ignore
  Object.keys(actions).some(key => payloadHasType(actions[key], toFind))

function compile(ns: ActionNS, {prelude, actions}: FileDesc): string {
  const rpcGenImport = actionHasType(actions, /(^|\W)RPCTypes\./)
    ? "import type * as RPCTypes from '../constants/types/rpc-gen'"
    : ''

  return `// NOTE: This file is GENERATED from json files in actions/json. Run 'yarn build-actions' to regenerate
${rpcGenImport}
${prelude.join('\n')}

// Constants
export const resetStore = 'common:resetStore' // not a part of ${ns} but is handled by every reducer. NEVER dispatch this
export const typePrefix = '${ns}:'
${compileActions(ns, actions, compileReduxTypeConstant)}

// Action Creators
${compileActions(ns, actions, compileActionCreator)}

// Action Payloads
${compileActions(ns, actions, compileActionPayloads)}

// All Actions
${compileAllActionsType(actions)}  | {readonly type: 'common:resetStore', readonly payload: undefined}
`
}

const compileActionMap = (ns: ActionNS, actions: Actions) => {
  Object.keys(actions).forEach(name => {
    typeMap.push(`    '${ns}:${name}': ${cleanName(ns)}.${capitalize(name)}Payload`)
  })
}

function compileAllActionsType(actions: Actions): string {
  const actionsTypes = Object.keys(actions)
    .map((name: ActionName) => `${capitalize(name)}Payload`)
    .sort()
    .join('\n  | ')
  return `// prettier-ignore
export type Actions =
  | ${actionsTypes}
`
}

function compileActions(ns: ActionNS, actions: Actions, compileActionFn: CompileActionFn): string {
  return (
    Object.keys(actions)
      // @ts-ignore
      .map((actionName: ActionName) => compileActionFn(ns, actionName, actions[actionName]))
      .sort()
      .join('\n')
  )
}

function capitalize(s: string): string {
  return (s[0]?.toUpperCase() ?? '') + s.slice(1)
}

function payloadKeys(p: ActionDesc) {
  return Object.keys(p).filter(key => !reservedPayloadKeys.includes(key))
}

function payloadOptional(p: ActionDesc) {
  const keys = payloadKeys(p)
  return keys.length && keys.every(key => key.endsWith('?'))
}

function printPayload(p: ActionDesc) {
  return payloadKeys(p).length
    ? '{' +
        payloadKeys(p)
          .map(key => {
            const val = p[key]
            return `readonly ${key}: ${Array.isArray(val) ? val.join(' | ') : val}`
          })
          .join(',\n') +
        '}'
    : 'undefined'
}

function compileActionPayloads(_: ActionNS, actionName: ActionName) {
  return `export type ${capitalize(actionName)}Payload = ReturnType<typeof create${capitalize(actionName)}>`
}

function compileActionCreator(_: ActionNS, actionName: ActionName, desc: ActionDesc) {
  const hasPayload = !!payloadKeys(desc).length
  const assignPayload = payloadOptional(desc)
  const comment = desc['_description']
    ? `/**
     * ${Array.isArray(desc['_description']) ? desc['_description'].join('\n* ') : desc['_description']}
     */
    `
    : ''
  const payload = hasPayload
    ? `payload: ${printPayload(desc)}${assignPayload ? ' = {}' : ''}`
    : 'payload?: undefined'
  return `${comment}export const create${capitalize(actionName)} = (${payload}) => (
  {payload, type: ${actionName} as typeof ${actionName}}
)`
}

function compileReduxTypeConstant(ns: ActionNS, actionName: ActionName, _: ActionDesc) {
  return `export const ${actionName} = '${ns}:${actionName}'`
}

function makeTypedActions(created: Array<string>) {
  return `// NOTE: This file is GENERATED from json files in actions/json. Run 'yarn build-actions' to regenerate
  ${created.map(c => `import type * as ${cleanName(c)} from './${c}-gen'`).join('\n')}

  export type TypedActions = ${created.map(c => `${cleanName(c)}.Actions`).join(' | ')}

  type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never
  type MapDiscriminatedUnion<T extends Record<K, string>, K extends keyof T> = { [V in T[K]]: DiscriminateUnion<T, K, V> };
  export type TypedActionsMap = MapDiscriminatedUnion<TypedActions, 'type'>
`
}

function main() {
  const root = path.join(__dirname, '../../actions/json')
  const files = fs.readdirSync(root)
  const created: Array<string> = []
  files
    .filter(file => path.extname(file) === '.json')
    .forEach(file => {
      const ns = path.basename(file, '.json')
      created.push(ns)
      console.log(`Generating ${ns}`)
      const desc: FileDesc = json5.parse(fs.readFileSync(path.join(root, file), {encoding: 'utf8'}))
      const outPath = path.join(root, '..', ns + '-gen.tsx')
      const generated: string = prettier.format(compile(ns, desc), {
        ...prettier.resolveConfig.sync(outPath),
        parser: 'typescript',
      })
      fs.writeFileSync(outPath, generated)
      compileActionMap(ns, desc.actions)
    })

  console.log(`Generating typed-actions-gen`)
  const outPath = path.join(root, '..', 'typed-actions-gen.tsx')
  const typedActions = makeTypedActions(created)
  const generated: string = prettier.format(typedActions, {
    ...prettier.resolveConfig.sync(outPath),
    parser: 'typescript',
  })
  fs.writeFileSync(outPath, generated)
}

main()
