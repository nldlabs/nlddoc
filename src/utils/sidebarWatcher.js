import { watch } from 'chokidar'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadConfig } from '../cli/config.js'
import { generateVitePressConfig } from '../vitepress/configGenerator.js'
import pc from 'picocolors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Watch for file structure changes and regenerate VitePress config
 * @param {string} docsPath - Absolute path to docs directory
 * @param {string} tempDir - Temporary VitePress project directory
 * @param {Function} onRestart - Callback to restart VitePress server
 */
export function watchSidebarChanges(docsPath, tempDir, onRestart) {
  console.log(pc.dim(`[watcher] Starting to watch: ${docsPath}`))
  console.log(pc.dim(`[watcher] Pattern: **/*.md, .nlddoc`))
  
  const watcher = watch(docsPath, {
    ignoreInitial: true,
    ignored: ['**/node_modules/**', '**/.vitepress/**', '**/dist/**', '**/.git/**'],
    depth: 99 // Watch all subdirectories
  })
  
  watcher.on('ready', () => {
    console.log(pc.dim('[watcher] Ready and watching for changes'))
  })
  
  watcher.on('error', (err) => {
    console.error(pc.red(`[watcher] Error: ${err.message}`))
  })
  
  let restartTimeout
  
  const regenerateConfig = (event, path) => {
    console.log(pc.cyan(`[watcher] Detected: ${event} - ${path}`))
    
    // Debounce to handle multiple rapid changes
    clearTimeout(restartTimeout)
    restartTimeout = setTimeout(() => {
      console.log(pc.dim(`\n  File ${event}: ${path}`))
      console.log(pc.dim('  Regenerating sidebar...\n'))
      
      // Reload config and regenerate VitePress config
      const config = loadConfig(docsPath)
      const vitepressConfig = generateVitePressConfig(config, docsPath, true)
      
      // Write updated config
      const configPath = join(tempDir, '.vitepress/config.mjs')
      const configContent = `import { generateVitePressConfig } from '${join(__dirname, '../vitepress/configGenerator.js').replace(/\\/g, '\\\\')}'

const userConfig = ${JSON.stringify(config, null, 2)}
const docsPath = '${docsPath.replace(/\\/g, '\\\\')}'

export default generateVitePressConfig(userConfig, docsPath, true)
`
      
      writeFileSync(configPath, configContent)
      console.log(pc.dim('[watcher] Config regenerated, triggering restart...'))
      
      // Trigger restart
      onRestart()
    }, 300) // Wait 300ms to batch changes
  }
  
  // Watch for file/folder additions and deletions (these affect sidebar)
  watcher.on('add', (path) => regenerateConfig('added', path))
  watcher.on('unlink', (path) => regenerateConfig('deleted', path))
  watcher.on('addDir', (path) => regenerateConfig('added directory', path))
  watcher.on('unlinkDir', (path) => regenerateConfig('deleted directory', path))
  
  // Watch for config changes
  watcher.on('change', (path) => {
    if (path === '.nlddoc') {
      regenerateConfig('changed', path)
    }
  })
  
  return watcher
}
