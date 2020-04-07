import { Node, Vector } from '@editor/types'
import { uid } from '@editor/util'
import {
  createRenderInput,
  createRenderOutput,
  createValueInput,
  createValueOutput,
  createProperty
} from '@editor/connector'


export const nodeList = [{
  name: 'List',
  type: 'Transform',
  create: createListNode
}, {
  name: 'Object',
  type: 'Transform',
  create: createObjectNode
}, {
  name: 'Pair',
  type: 'Value',
  create: createPairNode
}, {
  name: 'String',
  type: 'Value',
  create: createStringNode
}, {
  name: 'HTML Element',
  type: 'Render',
  create: createTagNode
}, {
  name: 'Preview',
  type: 'Output',
  create: createPreviewNode
}]

export function createPreviewNode(position: Vector): Node {
  const input = createRenderInput()
  input.mode = 'single'

  return {
    id: uid(),
    name: 'Preview',
    params: [],
    type: 'Preview',
    position,
    connectors: {
      input: [input],
      output: [],
      properties: []
    }
  }
}

export function createListNode(position: Vector): Node {
  return {
    id: uid(),
    name: 'List',
    params: [],
    position,
    type: 'List',
    connectors: {
      input: [createValueInput('String')],
      output: [createValueOutput('List')],
      properties: []
    }
  }
}

export function createObjectNode(position: Vector): Node {
  return {
    id: uid(),
    name: 'Object',
    params: [],
    type: 'Object',
    position,
    connectors: {
      input: [createValueInput('Pair')],
      output: [createValueOutput('Object')],
      properties: []
    }
  }
}

export function createPairNode(position: Vector): Node {
  return {
    id: uid(),
    name: 'Pair',
    params: [{
      name: 'Key',
      key: 'key',
      value: ''
    }, {
      name: 'Value',
      key: 'value',
      value: ''
    }],
    position,
    type: 'Pair',
    connectors: {
      input: [],
      output: [createValueOutput('Pair')],
      properties: []
    }
  }
}

export function createTagNode(position: Vector): Node {
  return {
    id: uid(),
    name: 'HTML Element',
    params: [{
      name: 'Tag',
      key: 'tag',
      value: 'div'
    }],
    position,
    type: 'Tag',
    connectors: {
      input: [createRenderInput()],
      output: [createRenderOutput()],
      properties: [
        createProperty('classList', 'List'),
        createProperty('style', 'Object'),
        createProperty('props', 'Object')
      ]
    }
  }
}

export function createStringNode(position: Vector): Node {
  return {
    id: uid(),
    name: 'String',
    params: [{
      name: '',
      key: 'value',
      value: ''
    }],
    position,
    type: 'String',
    connectors: {
      input: [],
      output: [createValueOutput('String')],
      properties: []
    }
  }
}
