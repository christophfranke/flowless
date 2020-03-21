import React from 'react'
import { Node, Input, RenderOutput } from '@engine/types'

import Combine from './combine'
import Text from './text'
import Tag from './tag'

const RenderComponents = {
  Combine,
  Text,
  Tag
}

export function renderNode(node: Node): RenderOutput {
  const Component = RenderComponents[node.type]
  const props = {
    params: node.params,
    inputs: node.inputs
  }

  return Component(props)
}

export function renderInputs(inputs: Input[]): RenderOutput[] {
  return inputs.map(input => renderNode(input.node))
}
