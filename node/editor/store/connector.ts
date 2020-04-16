import { computed, observable } from 'mobx'

import { Connector, ConnectorGroup, Ports, Connection, ConnectorState, ConnectorDescription, ConnectorFunction, ValueType, Node } from '@editor/types'
import Store from '@editor/store'
import { type, expectedType } from '@engine/render'
import { canMatch } from '@engine/type-functions'
import { transformer } from '@shared/util'

import * as Engine from '@engine/types'


export default class ConnectorFunctions {
  store: Store
  constructor(store: Store) {
    this.store = store
  }

  @transformer
  connector<F extends ConnectorFunction>(description: ConnectorDescription<F>): Connector<F> | null {
    const node = this.store.getNodeById(description.nodeId)
    if (!node) {
      console.warn('node not found', description)
      return null
    }

    const ports = this.ports(node)
    const group = [...ports[description.function].main, ...ports[description.function].side]
      .find(group => group.key === description.key)

    if (group) {
      return group.connectors[description.slot]
    }

    return null
  }

  description<F extends ConnectorFunction>(connector: Connector<F>): ConnectorDescription<F> {
    return {
      nodeId: connector.group.ports.node.id,
      key: connector.group.key,
      slot: connector.group.connectors.indexOf(connector),
      function: connector.group.function as F
    }
  }

  areSame(one: ConnectorDescription, other: ConnectorDescription): boolean {
    return one.nodeId === other.nodeId
      && one.key === other.key
      && one.slot === other.slot
      && one.function === other.function
  }

  @transformer
  ports(node: Node): Ports {
    const ports: Ports = observable({
      node,
      input: {
        main: [],
        side: []
      },
      output: {
        main: [],
        side: []
      }
    })

    ports.input.main = Object.keys(this.store.definitions.Node[node.type].type.input || {})
      .map(key => this.createInput(key, ports))

    ports.output.main = Object.keys(this.store.definitions.Node[node.type].type.output || {})
      .map(key => this.createOutput(key, ports))

    return ports
  }

  createInput = (key: string, ports: Ports): ConnectorGroup<'input', 'single'> => {
    const group: ConnectorGroup<'input', 'single'> = observable({
      key,
      ports,
      connectors: [],
      mode: 'single',
      name: 'input',
      function: 'input',
      direction: { x: 0, y: -1 },
    })

    group.connectors = [{
      group
    }]

    return group
  }

  createOutput = (key: string, ports: Ports): ConnectorGroup<'output', 'multiple'> => {
    const group: ConnectorGroup<'output', 'multiple'> = observable({
      key,
      ports,
      connectors: [],
      mode: 'multiple',
      name: 'output',
      function: 'output',
      direction: { x: 0, y: 1 },
    })

    group.connectors = [{
      group
    }]

    return group
  }

  valuesAreCompatible(src: ConnectorGroup<'output'>, dest: ConnectorGroup<'input'>): boolean {
    const srcType = type(this.store.translated.getNode(src.ports.node), this.store.context)
    const targetType = expectedType(
      this.store.translated.getNode(dest.ports.node),
      dest.key,
      this.store.context
    )

    console.warn('valuesAreCompatible not implemented anymore')
    // return canMatch(srcType, targetType)
    return true
  }

  willProduceLoop(src?: Node, dest?: Node): boolean {
    return !!src && !!dest && this.store.getSubtree(src).includes(dest)
  }

  isSrc(group: ConnectorGroup): group is ConnectorGroup<'output'> {
    return group.function === 'output'
  }

  canConnect(pending: Connector, possiblyHot: Connector): boolean {
    const src = this.isSrc(pending.group) ? pending : possiblyHot
    const dest = this.isSrc(pending.group) ? possiblyHot : pending

    return src !== dest
      && !this.willProduceLoop(src.group.ports.node, dest.group.ports.node)
      && !(src.group.mode === 'multiple' && dest.group.mode === 'multiple')
      && this.valuesAreCompatible(src.group, dest.group)
  }

  @transformer
  state(connector: Connector): ConnectorState {
    if (this.store.pendingConnector) {
      if (this.store.pendingConnector === connector) {
        return 'pending'
      }
      if (this.canConnect(this.store.pendingConnector, connector)) {
        return 'hot'
      }
    }

    return 'default'
  }

  @transformer
  getConnections(connector: Connector): Connection[] {
    return this.store.connections
      .filter(connection =>
        this.areSame(connection.src, this.description(connector)) ||
        this.areSame(connection.target, this.description(connector)))
  }

  @transformer
  countConnections(connector: Connector): number {
    return this.getConnections(connector).length
  }

  cloneConnector(src: Connector) {
    return {
      ...src,
      id: this.store.uid()
    }
  }
}
