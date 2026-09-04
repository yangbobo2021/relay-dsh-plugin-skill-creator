import type { UserConfig } from 'tsdown'

const config: UserConfig = {
  entry: { index: 'src/index.ts' },
  outDir: 'lib',
  format: 'esm',
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: false,
  deps: {
    neverBundle: specifier => /^node:/.test(specifier) || /^@deepseek-ai\//.test(specifier) || specifier === 'yaml',
    alwaysBundle: specifier => !/^node:/.test(specifier) && !/^@deepseek-ai\//.test(specifier) && specifier !== 'yaml',
  },
}

export default config
