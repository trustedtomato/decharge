import type { JSX } from 'preact'

export interface DynamicRoute<T> {
  dataList: T[]
  Page: (props: {data: T, index: number}) => JSX.Element
}

export type SimpleRoute = () => JSX.Element
