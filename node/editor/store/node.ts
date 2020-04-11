import { Node, Vector } from '@editor/types'
import { CoreNode } from '@engine/types'

import Store from '@editor/store'
import Nodes from '@engine/nodes'

export default class NodeFunctions {
  store: Store
  constructor(store: Store) {
    this.store = store
  }

  nodeList = [{
    name: 'Array',
    type: 'Value',
    create: (position: Vector): Node => this.createNode(position, 'Array')
  }, {
    name: 'Collect',
    type: 'Value',
    create: this.createCollectNode.bind(this)
  }, {
    name: 'Iterate',
    type: 'Value',
    create: this.createIterateNode.bind(this)
  }, {
    name: 'Object',
    type: 'Value',
    create: (position: Vector): Node => this.createNode(position, 'Object')
  }, {
    name: 'String',
    type: 'Value',
    create: this.createStringNode.bind(this)
  }, {
    name: 'Boolean',
    type: 'Value',
    create: this.createBooleanNode.bind(this)
  }, {
    name: 'Pair',
    type: 'Value',
    create: this.createPairNode.bind(this)
  }, {
    name: 'Number',
    type: 'Value',
    create: this.createNumberNode.bind(this)
  }, {
    name: 'HTML Element',
    type: 'Render',
    create: this.createTagNode.bind(this)
  }, {
    name: 'Preview',
    type: 'Output',
    create: this.createPreviewNode.bind(this)
  }]

  createNode(position: Vector, type: CoreNode): Node {
    const Node = Nodes[type]
    const property = this.store.connector.createProperty

    return {
      id: this.store.uid(),
      name: type,
      type,
      params: [],
      position,
      connectors: {
        input: Node.type.input ? [this.store.connector.createInput()] : [],
        output: [this.store.connector.createOutput()],
        properties: Object.keys(Node.type.properties)
          .map(key => property(key))
      }
    }
  }

  createPreviewNode(position: Vector): Node {
    const node = this.createNode(position, 'Preview')
    node.connectors.input[0].mode = 'single'
    node.connectors.output = []
    return node
  }

  createCollectNode(position: Vector): Node {
    const node = this.createNode(position, 'Collect')
    node.connectors.input[0].mode = 'single'

    return node
  }

  createIterateNode(position: Vector): Node {
    const node = this.createNode(position, 'Iterate')
    node.connectors.input[0].mode = 'single'

    return node
  }

  createPairNode(position: Vector): Node {
    const node = this.createNode(position, 'Pair')
    node.connectors.input[0].mode = 'single'
    node.params = [{
      name: 'Key',
      key: 'key',
      value: ''
    }]

    return node
  }

  createTagNode(position: Vector): Node {
    const node = this.createNode(position, 'Tag')
    node.name = 'HTML Element'
    node.params = [{
      name: 'Tag',
      key: 'tag',
      value: 'div'
    }]

    return node
  }

  createStringNode(position: Vector): Node {
    const node = this.createNode(position, 'String')
    node.params = [{
      name: '',
      key: 'value',
      value: ''
    }]
    
    return node
  }

  createNumberNode(position: Vector): Node {
    const node = this.createNode(position, 'Number')
    node.params = [{
      name: '',
      key: 'value',
      value: ''
    }]
    
    return node
  }

  createBooleanNode(position: Vector): Node {
    const node = this.createNode(position, 'Boolean')
    node.params = [{
      name: '',
      key: 'value',
      value: ''
    }]
    
    return node
  }
}
