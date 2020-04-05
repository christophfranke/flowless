import React from 'react'
import { observer } from 'mobx-react'

import { Node, RenderProps } from '@engine/types'

const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']

const allowedFirst = 'abcdefghijklmnopqrstuvwxyz'.split('')
const allowed = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('')
const sanitize = tag => {
  let firstLetterFound = false
  return tag.split('')
    .filter(letter => {
      const test = firstLetterFound ? allowed : allowedFirst
      const result = test.includes(letter)
      firstLetterFound = result || firstLetterFound
      return result
    }).join('')
}
const isValid = tag => !!tag

export default observer((props: RenderProps) => {
  const Tag = sanitize(props.params['tag'])
  const tagProps = {
    ...(props.properties.props || {}),
    style: props.properties.style,
  }
  if (props.properties.classList) {
    tagProps.className = props.properties.classList.join(' ')
  }

  if (isValid(Tag)) {
    return React.Children.count(props.children) > 0 && !voidElements.includes(Tag)
      ? <Tag {...tagProps}>{props.children}</Tag>
      : <Tag {...tagProps} />
  }

  return <>{props.children}</>
})