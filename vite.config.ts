import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// Library build: bundles the game + explainer for consumption by other apps.
// react / react-dom / @emotion are left as peer dependencies so the
// host app provides a single shared copy.
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.client.json',
      include: ['src/client'],
      outDir: 'dist/lib',
      insertTypesEntry: true,
    }),
  ],
  build: {
    outDir: 'dist/lib',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/client/lib/index.tsx'),
      name: 'Arithmix',
      formats: ['es', 'umd'],
      fileName: (format) => `arithmix.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        '@emotion/react',
        '@emotion/react/jsx-runtime',
        '@emotion/styled',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOMClient',
          'react/jsx-runtime': 'jsxRuntime',
          '@emotion/react': 'emotionReact',
          '@emotion/react/jsx-runtime': 'emotionJsxRuntime',
          '@emotion/styled': 'emotionStyled',
        },
      },
    },
  },
})
