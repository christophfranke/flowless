import * as Engine from '@engine/types'
import * as Editor from '@editor/types'

import { value, type, unmatchedType } from '@engine/render'
import { inputs, outputs } from '@engine/tree'
import { intersectAll, createEmptyValue } from '@engine/type-functions'

import * as Core from '@engine/modules/core'

export type Nodes = 'Object' | 'Pair' | 'Key'
export const Node: Engine.ModuleNodes<Nodes> = {
  Object: {
    value: (node: Engine.Node, scope: Engine.Scope) => inputs(node)
      .map(port => value(port.node, scope, port.key))
      .filter(pair => pair.key)
      .reduce((obj, pair) => ({
        ...obj,
        [pair.key.trim()]: pair.value
      }), {}),
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => Type.Object.create(inputs(node)
          .map(src => ({
            key: src.node.params.key.trim(),
            type: unmatchedType(src.node, context, src.key).params.value
              || Core.Type.Mismatch.create(`Expected Pair, got ${unmatchedType(src.node, context, src.key).name}`)
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
  },
  Key: {
    value: (node: Engine.Node, scope: Engine.Scope) => {
      return inputs(node).length > 0
        ? value(inputs(node)[0].node, scope, inputs(node)[0].key)[node.params.key.trim()]
        : createEmptyValue(type(node, scope.context))
    },
    type: {
      output: {
        output: (node:Engine. Node, context: Engine.Context) => {
          if (inputs(node).length > 0 && node.params.key) {
            const inputType = unmatchedType(inputs(node)[0].node, context, inputs(node)[0].key)
            if (inputType.name !== 'Unresolved') {
              return inputType.params[node.params.key.trim()]
                || Core.Type.Mismatch.create(`Expected Object with key ${node.params.key.trim()}`)
            }
          }

          return Core.Type.Unresolved.create()
        }
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => node.params.key
          ? Type.Object.create({ [node.params.key.trim()]: type(node, context) })
          : Type.Object.create({})
      }
    }
  },
  Pair: {
    value: (node: Engine.Node, scope: Engine.Scope) => ({
      key: node.params.key.trim(),
      value: inputs(node).length > 0
        ? value(inputs(node)[0].node, scope, inputs(node)[0].key)
        : createEmptyValue(type(node, scope.context).params.value)
    }),
    type: {
      output: {
        output: (node: Engine.Node, context: Engine.Context) => Type.Pair.create(inputs(node).length > 0
          ? unmatchedType(inputs(node)[0].node, context, inputs(node)[0].key)
          : Core.Type.Unresolved.create())
      },
      input: {
        input: (node: Engine.Node, context: Engine.Context) => type(node, context).params.value
      }
    }
  },
}

export const EditorNode: Editor.ModuleNodes<Nodes> = {
  Object: {
    type: 'Value',
    ports: {
      input: {
        input: ['duplicate']
      }
    },
    create: () => ({
      name: 'Object',
      type: 'Object',
      params: [],
    })    
  },
  Pair: {
    type: 'Value',
    create: () => ({
      name: 'Pair',
      type: 'Pair',
      params: [{
        name: 'Key',
        key: 'key',
        value: '',
        type: 'text'
      }],
    })    
  },
  Key: {
    type: 'Value',
    create:() => ({
      name: 'Key',
      type: 'Key',
      params: [{
        name: 'Key',
        key: 'key',
        value: '',
        type: 'text'
      }]
    })
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
