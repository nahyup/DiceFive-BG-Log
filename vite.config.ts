import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.resolve(__dirname, 'data.json')

// Custom Vite plugin to handle local file system persistence
const localDataPlugin = () => ({
  name: 'local-data-plugin',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url === '/api/data') {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')

        if (req.method === 'GET') {
          try {
            if (fs.existsSync(dataFilePath)) {
              const data = fs.readFileSync(dataFilePath, 'utf-8')
              res.end(data)
            } else {
              res.end(JSON.stringify(null)) // Return null if file doesn't exist yet
            }
          } catch (error) {
            console.error('Error reading data.json:', error)
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to read data' }))
          }
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: any) => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              // Basic validation to ensure it's valid JSON
              JSON.parse(body)
              fs.writeFileSync(dataFilePath, body, 'utf-8')
              res.end(JSON.stringify({ success: true }))
            } catch (error) {
              console.error('Error writing data.json:', error)
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to write data' }))
            }
          })
          return
        }
      }
      next()
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localDataPlugin()],
})
