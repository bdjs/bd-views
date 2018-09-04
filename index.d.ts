declare module 'bd-views'

declare type Config = {
  apps: {
    [key in string]: any
  },
  configs: {
    views: {
      [key in string]: any
    }
  }
}

declare function main (app: Config): void

export default main
