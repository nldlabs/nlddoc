import { watch } from 'chokidar'
import { utimesSync } from 'fs'
import { join } from 'path'

/**
 * Vite plugin to reload VitePress when markdown files or config changes
 * @param {string} docsPath - Absolute path to docs directory
 * @returns {Object} Vite plugin
 */
export default function sidebarReloadPlugin(docsPath) {
  return {
    name: 'vitepress-sidebar-reload',
    configureServer(server) {
      let configPath = null
      
      // Get the config file path once server is configured
      const getConfigPath = () => {
        if (!configPath && server.config.configFile) {
          configPath = server.config.configFile
        }
        return configPath
      }

      const watcher = watch(['**/*.md', '.nlddoc'], {
        cwd: docsPath,
        ignoreInitial: true,
        ignored: ['**/node_modules/**', '**/.vitepress/**']
      })

      const triggerReload = () => {
        const cfgPath = getConfigPath()
        if (cfgPath) {
          const now = new Date()
          try {
            utimesSync(cfgPath, now, now)
          } catch (err) {
            // Config file might not exist yet
          }
        }
      }

      watcher.on('add', triggerReload)
      watcher.on('unlink', triggerReload)
      watcher.on('unlinkDir', triggerReload)
      watcher.on('addDir', triggerReload)
      watcher.on('change', (path) => {
        // Reload config when .nlddoc changes
        if (path === '.nlddoc') {
          triggerReload()
        }
      })
    }
  }
}
