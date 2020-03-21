import { Node, Input } from '@engine/types'

export function create(type: string): Node
export function create(type: string, inputs: Input[]): Node
export function create(type: string, params: Object): Node
export function create(type: string, params: Object, inputs: Input[]): Node

export function create(type: string, arg1?: Input[] | Object, arg2?: Input[] | Object): Node {
  let inputs: Input[] = []
  let params: Object = {}

  if (Array.isArray(arg1)) {
    inputs = arg1
  } else if (Array.isArray(arg2)) {
    inputs = arg2
  }

  if (arg1 && typeof arg1 === 'object' && !Array.isArray(arg1)) {
    params = arg1
  } else if (arg2 && typeof arg2 === 'object' && !Array.isArray(arg2)) {
    params = arg2
  }

  return {
    params,
    type,
    inputs
  }
}
