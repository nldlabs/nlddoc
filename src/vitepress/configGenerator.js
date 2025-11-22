import { generateSidebar } from './sidebarGenerator.js'
import sidebarReloadPlugin from './sidebarReloadPlugin.js'

/**
 * Generate VitePress configuration from user config and docs path
 * @param {Object} userConfig - User configuration from .nlddoc file
 * @param {string} docsPath - Absolute path to documentation directory
 * @param {boolean} useSrcDir - Whether to use srcDir (true for serve, false for build)
 * @returns {Object} VitePress configuration object
 */
export function generateVitePressConfig(userConfig, docsPath, useSrcDir = true) {
  const config = {
    title: userConfig.title,
    description: userConfig.description,
    themeConfig: {
      logo: userConfig.logo,
      nav: [
        { text: 'Home', link: '/' }
      ],
      sidebar: generateSidebar(docsPath),
      outline: userConfig.outline.enabled ? {
        level: userConfig.outline.depth,
        label: userConfig.outline.label
      } : false,
      search: userConfig.search ? {
        provider: 'local'
      } : undefined
    },
    vite: {
      plugins: [sidebarReloadPlugin(docsPath)],
      server: {
        watch: {
          usePolling: false
        }
      },
      optimizeDeps: {
        exclude: ['vitepress']
      }
    }
  }
  
  // Only use srcDir for serve (dev server with hot reload)
  // For build, files are copied to temp dir to fix Vue module resolution
  if (useSrcDir) {
    config.srcDir = docsPath
  }
  
  return config
}
