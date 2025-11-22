import { resolve, isAbsolute } from 'path'
import { existsSync, statSync, readdirSync } from 'fs'
import { spawn } from 'child_process'
import { loadConfig } from './config.js'
import { createTempProject, registerCleanupHandlers } from '../utils/tempProject.js'
import { info, success, error } from '../utils/logger.js'
import pc from 'picocolors'

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
  
  // Load configuration
  const config = loadConfig(absoluteDocsPath)
  
  console.log()
  console.log(pc.cyan(pc.bold('📙 nlddoc')))
  console.log()
  
  // Create temporary VitePress project
  const tempDir = createTempProject(absoluteDocsPath, config)
  
  // Register cleanup handlers
  registerCleanupHandlers(tempDir)
  
  // Install dependencies in temp directory
  process.stdout.write(pc.dim('⚙  Setting up...'))
  await new Promise((resolve, reject) => {
    const npm = spawn('npm', ['install'], {
      cwd: tempDir,
      stdio: 'pipe'  // Hide npm output
    })
    
    npm.on('close', (code) => {
      process.stdout.write('\r\x1b[K') // Clear line
      if (code === 0) resolve()
      else reject(new Error(`Setup failed`))
    })
  })
  
  process.stdout.write(pc.dim('🚀 Starting server...'))
  
  // Start VitePress dev server using local binary
  const vitepressBin = resolve(tempDir, 'node_modules/.bin/vitepress')
  const vitepressArgs = ['dev']
  
  if (options.port) {
    vitepressArgs.push('--port', options.port)
  }
  
  if (options.host) {
    vitepressArgs.push('--host')
  }
  
  const vitepress = spawn(vitepressBin, vitepressArgs, {
    cwd: tempDir,
    stdio: ['inherit', 'pipe', 'pipe'] // stdin, stdout, stderr - pipe both to capture
  })
  
  // Handle spawn errors
  vitepress.on('error', (err) => {
    error(`Failed to start server: ${err.message}`)
    process.exit(1)
  })
  
  // Filter stderr to remove dependency warnings
  let hasShownTips = false
  let serverUrls = { local: null, network: null }
  
  if (vitepress.stderr) {
    vitepress.stderr.on('data', (data) => {
      const output = data.toString()
      // Only show actual errors, not warnings
      if (output.includes('error') && 
          !output.includes('Failed to resolve dependency') && 
          !output.includes('optimizeDeps.include')) {
        process.stderr.write(data)
      }
    })
  }
  
  if (vitepress.stdout) {
    vitepress.stdout.on('data', (data) => {
      const output = data.toString()
      
      // Extract URLs from VitePress output
      const localMatch = output.match(/Local:\s+(http:\/\/[^\s]+)/)
      const networkMatch = output.match(/Network:\s+(http:\/\/[^\s]+)/)
      
      if (localMatch) serverUrls.local = localMatch[1]
      if (networkMatch) serverUrls.network = networkMatch[1]
      
      // Show our custom ready message when VitePress is ready
      if (!hasShownTips && output.includes('Local:')) {
        hasShownTips = true
        process.stdout.write('\r\x1b[K') // Clear "Starting server..." line
        
        console.log(pc.green('✓') + pc.bold(' Server ready!'))
        console.log()
        console.log(pc.dim('─'.repeat(60)))
        console.log()
        console.log(`  ${pc.green('●')} ${pc.bold('Local:   ')} ${pc.cyan(serverUrls.local || 'http://localhost:5173')}`)
        if (serverUrls.network) {
          console.log(`  ${pc.dim('●')} ${pc.bold('Network: ')} ${pc.cyan(serverUrls.network)}`)
        }
        console.log()
        console.log(`  ${pc.dim('Serving')} ${pc.cyan(absoluteDocsPath)}`)
        console.log(`  ${pc.dim('Press')} ${pc.bold('Ctrl+C')} ${pc.dim('to stop')}`)
        console.log()
        console.log(pc.dim('─'.repeat(60)))        
        console.log()
      }
      
      // Suppress all VitePress stdout output (we've extracted what we need)
    })
  }
  
  vitepress.on('close', (code) => {
    console.log()
    if (code === 0) {
      console.log(pc.dim('✓ Server stopped'))
    } else {
      console.log(pc.yellow('⚠ Server stopped with errors'))
    }
    process.exit(code)
  })
}
