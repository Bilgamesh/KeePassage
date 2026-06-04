declare module 'node:process' {
  global {
    namespace NodeJS {
      interface ProcessVersions {
        bun?: string;
        electron?: string;
        yode?: string;
      }
    }
  }
}
