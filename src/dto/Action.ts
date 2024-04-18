import type { FunctionalComponent, SVGAttributes } from "vue"

export interface Action {
  label: string
  title: string

  icon?: FunctionalComponent<SVGAttributes, {}, any>

  function: Function
}