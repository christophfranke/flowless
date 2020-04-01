import React from 'react'
import { observer, inject } from 'mobx-react'

import { Node, Vector } from '@editor/types'

import * as LA from '@editor/la'
import store from '@editor/store'
import ConnectorView from '@editor/components/connector'

interface Props {
  node: Node
}

const CONNECTOR_SIZE = 15
const DESCRIPTION_HEIGHT = 20
const DESCRIPTION_WIDTH = 100
const NODE_PADDING = 5

@inject('mouse')
@observer
class NodeView extends React.Component<Props> {
  offset: Vector

  handleMouseDown = e => {
    e.preventDefault()
    e.stopPropagation()

    const mouse = this.props['mouse'].position
    if (mouse) {
      this.offset = LA.subtract(mouse, this.props.node.position)

      window.addEventListener('mousemove', this.handleMouseMove)
      window.addEventListener('mouseup', this.handleMouseUp)
    }
  }

  handleMouseMove = e => {
    const mouse = this.props['mouse'].position
    if (mouse) {
      this.props.node.position = LA.subtract(mouse, this.offset)
    }
  }

  handleMouseUp = () => {
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleMouseUp)
  }

  handleDelete = e => {
    e.stopPropagation()
    e.preventDefault()
    store.deleteNode(this.props.node)
  }

  stop = e => {
    e.stopPropagation()
  }

  render() {
    const { node } = this.props

    const height = 2 * CONNECTOR_SIZE + DESCRIPTION_HEIGHT + 2 * NODE_PADDING
    const width = Math.max(
      (node.connectors.input.length + node.connectors.output.length) * CONNECTOR_SIZE,
      DESCRIPTION_WIDTH) + 2 * NODE_PADDING

    const nodeStyle: React.CSSProperties = {
      padding: '10px',
      position: 'absolute',
      cursor: 'move',
      willChange: 'transform',
      transform: `translate(${this.props.node.position.x}px, ${this.props.node.position.y}px)`,
      backgroundColor: 'white',
      outline: '1px solid pink',
    }

    const nameStyle: React.CSSProperties = {
      textAlign: 'center',
      fontSize: '24px'
    }

    const inputStyle: React.CSSProperties = {
      outline: 'none',
      width: 'auto',
      margin: '8px',
      borderBottom: '1px solid black',
    }

    const closeStyle: React.CSSProperties = {
      gridArea: 'close',
      transform: 'scale(1.2)',
      color: 'black',
      cursor: 'pointer'
    }

    const innerStyle: React.CSSProperties = {
      position: 'relative',
      display: 'grid',
      gridTemplate: `
        "x input close" auto
        "props params actions" auto
        "y output z" auto /
        1fr min-content 1fr`
    }

    return <div style={nodeStyle} onMouseDown={this.handleMouseDown}>
        <div style={innerStyle}>
          <div style={{ display: 'flex', justifyContent: 'center', gridArea: 'input' }}>
            {node.connectors.input.map(input => <ConnectorView key={input.id} connector={input} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gridArea: 'props' }}>
            {node.connectors.properties.map(property => <ConnectorView key={property.id} connector={property} />)}
          </div>
          <svg onClick={this.handleDelete} style={closeStyle} width="24" height="24" viewBox="0 0 24 24">
            <use xlinkHref="/icons/close.svg#close" />
          </svg>
          <div style={{ gridArea: 'params' }}>
            <div style={nameStyle}>{node.name} ({node.id})</div>
            {node.params.map(param => <div key={param.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label>{param.name}</label>
              <input type="text" style={inputStyle} value={param.value} onChange={(e) => param.value = e.target.value} onMouseDown={this.stop} />
            </div>)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gridArea: 'output' }}>
            {node.connectors.output.map(output => <ConnectorView key={output.id} connector={output} />)}
          </div>
        </div>
      </div>
  }
}

export default NodeView