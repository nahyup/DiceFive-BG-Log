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
        // Handle /api/data
        if (req.url === '/api/data') {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')

          if (req.method === 'GET') {
            try {
              if (fs.existsSync(dataFilePath)) {
                const data = fs.readFileSync(dataFilePath, 'utf-8')
                res.end(data)
              } else {
                res.end(JSON.stringify(null))
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
            req.on('data', (chunk: any) => { body += chunk.toString() })
            req.on('end', () => {
              try {
                JSON.parse(body) // Validation
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

        // Handle /api/upload
        if (req.url === '/api/upload' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          
          let body = ''
          req.on('data', (chunk: any) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const { image, name } = JSON.parse(body)
              if (!image || !name) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Missing image or name' }))
                return
              }

              const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
              const buffer = Buffer.from(base64Data, 'base64')
              
              const safeName = name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
              const fileName = `${Date.now()}-${safeName}`
              const uploadsDir = path.resolve(__dirname, 'public/uploads')
              
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true })
              }
              
              const filePath = path.resolve(uploadsDir, fileName)
              fs.writeFileSync(filePath, buffer)
              
              res.end(JSON.stringify({ url: `/uploads/${fileName}` }))
            } catch (error) {
              console.error('Error handling upload:', error)
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Internal Server Error' }))
            }
          })
          return
        }

        next()
      })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localDataPlugin()],
  server: {
    host: true
  }
})
