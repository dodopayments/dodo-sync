import { defineConfig } from 'tsdown';

export default defineConfig({
    format: ['cjs', 'esm'],
    entry: ['./src/index.ts'],
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
    minify: true,
    outDir: './dist',
    // dts: {
    //     resolve: ['dodopayments/client'],
    //     resolver: 'tsc',
    // },
});