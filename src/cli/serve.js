import { resolve, isAbsolute } from 'path'
import { existsSync, statSync, readdirSync } from 'fs'
import { spawn } from 'child_process'
import { loadConfig } from './config.js'
import { createTempProject, registerCleanupHandlers } from '../utils/tempProject.js'
import { info, success, error } from '../utils/logger.js'

export async function serve(docsPath = '.', options = {}) {
  // Resolve absolute path
  const absoluteDocsPath = isAbsolute(docsPath) ? docsPath : resolve(process.cwd(), docsPath)
  
  // Validate path
  if (!existsSync(absoluteDocsPath)) {
    error(`Documentation directory not found: ${absoluteDocsPath}`)
    process.exit(1)
  }
  
  if (!statSync(absoluteDocsPath).isDirectory()) {
    error(`Path is not a directory: ${absoluteDocsPath}`)
    process.exit(1)
  }
  
  // Check for at least one markdown file
  const hasMarkdown = readdirSync(absoluteDocsPath, { recursive: true })
    .some(file => file.toString().endsWith('.md'))
  
  if (!hasMarkdown) {
    error('No markdown files found in directory')
    process.exit(1)
  }
  
  info(`Starting documentation server for: ${absoluteDocsPath}`)
  
  // Load configuration
  const config = loadConfig(absoluteDocsPath)
  info(`Site title: ${config.title}`)
  
  // Create temporary VitePress project
  info('Creating temporary project...')
  const tempDir = createTempProject(absoluteDocsPath, config)
  success(`Temporary project created at: ${tempDir}`)
  
  // Register cleanup handlers
  registerCleanupHandlers(tempDir)
  
  // Install dependencies in temp directory
  info('Installing dependencies...')
  await new Promise((resolve, reject) => {
    const npm = spawn('npm', ['install'], {
      cwd: tempDir,
      stdio: 'inherit'
    })
    
    npm.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`npm install failed with code ${code}`))
    })
  })
  
  success('Dependencies installed')
  
  // Start VitePress dev server
  info(`Starting VitePress on port ${options.port || 5173}...`)
  
  const vitepressArgs = ['vitepress', 'dev']
  
  if (options.port) {
    vitepressArgs.push('--port', options.port)
  }
  
  if (options.host) {
    vitepressArgs.push('--host')
  }
  
  const vitepress = spawn('npx', vitepressArgs, {
    cwd: tempDir,
    stdio: 'inherit'
  })
  
  vitepress.on('close', (code) => {
    info('Server stopped')
    process.exit(code)
  })
}
