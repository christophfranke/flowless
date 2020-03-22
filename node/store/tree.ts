import { observable } from 'mobx'
import { useStaticRendering } from "mobx-react"
import { Node } from '@engine/types'
import { EditorNode } from '@editor/types'

import createNode from '@engine/create-node'
import createEditorNode from '@editor/create-node'

const isServer = typeof window === 'undefined'

useStaticRendering(isServer)


// const createRoot = (): Node => {
//   const hello = create('Text', { text: 'Hello World' })
//   const lorem = create('Text', { text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.' })
//   const headline = create('Tag', { tag: 'h1' }, [
//     { node: hello }
//   ])
//   const image = create('Tag', { tag: 'img', props: { src: 'https://helpx.adobe.com/content/dam/help/en/stock/how-to/visual-reverse-image-search/jcr_content/main-pars/image/visual-reverse-image-search-v2_intro.jpg' }})
//   const root = create('Combine', [
//     { node: headline },
//     { node: lorem },
//     { node: image },
//   ])

//   return root
// }

class Tree {
  @observable root: Node
  @observable displayNodes: EditorNode[]
  @observable editor = {
    sheetDimensions: {
      x: 1000, // px
      y: 1000, // px
    },
    highZ: 0
  }

  pxToVw(pixel: number): number {
    return 100 * pixel / this.editor.sheetDimensions.x
  }

  getHighZ() {
    this.editor.highZ += 1
    return this.editor.highZ
  }

  constructor() {
    this.root = createNode('Combine')
    this.displayNodes = [createEditorNode(this.root, { movable: false, editable: false })]
    if (!isServer) {
      window.addEventListener('resize', () => {
        this.editor.sheetDimensions.x = window.innerWidth / 2
      })
    }
  }
}

const tree = new Tree()

if (typeof window !== 'undefined') {
  window['tree'] = tree
}

export default tree