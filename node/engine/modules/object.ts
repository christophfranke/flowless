import * as Engine from '@engine/types'

import { value, type, unmatchedType } from '@engine/render'
import { intersectAll } from '@engine/type-functions'

import * as Core from '@engine/modules/core'

export type Nodes = 'Object'
export const Node: Engine.ModuleNodes<Nodes> = {
  Object: {
    value: (node: Engine.Node, scope: Engine.Scope) => node.connections.input
      .map(connection => value(connection.node, scope))
      .filter(pair => pair.key)
      .reduce((obj, pair) => ({
        ...obj,
        [pair.key.trim()]: pair.value
      }), {}),
    type: {
      output: {
        output: (node: Engine.Node) => Type.Object.create(node.connections.input
          .map(connection => ({
            key: connection.node.params.key.trim(),
            type: unmatchedType(connection.node).params.value
              || Core.Type.Mismatch.create(`Expected Pair, got ${unmatchedType(connection.node).name}`)
          }))
          .filter(pair => pair.key)
          .reduce((obj, pair) => ({
            ...obj,
            [pair.key.trim()]: pair.type
          }), {}))
      },
      input: {
        input: () => Type.Pair.create(Core.Type.Unresolved.create())
        // input: (node, other) => other && other.params.key
        // ? Type.Pair(type(node).params[other!.params.key.trim()])
        // : Type.Pair(Type.Unresolved)
      }
    }
  }
}

export type Types = 'Object' | 'Pair'
export const Type: Engine.ModuleTypes<Types> = {
  Object: {
    create: (params: { [key: string]: Engine.ValueType }) => ({
      display: 'Object {}',
      name: 'Object',
      params
    }),
    emptyValue: () => {},
    test: value => {
      console.warn('Object test not implemented')
      return true
    }
  },
  Pair: {
    create: (value: Engine.ValueType) => ({
      display: 'Pair<{value}>',
      name: 'Pair',
      params: {
        value
      }
    }),
    emptyValue: () => {
      console.warn('empty pair create not implemented yet')
      return {
        key: '',
        value: ''
      }
    },
    test: (value) => {
      console.warn('test pair is not implemented yet')
      return true
    }
  }
}
