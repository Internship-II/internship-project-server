export const performanceConfig = {
  // Database performance settings
  database: {
    poolSize: 20,
    connectionTimeout: 60000,
    queryTimeout: 10000,
    cacheDuration: 30000,
  },
  
  // File upload settings
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB (increased from 10MB)
    maxFiles: 5,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    cloudStorage: {
      enabled: process.env.CLOUDINARY_CLOUD_NAME !== undefined,
      provider: 'cloudinary',
      folder: 'question-bank',
      transformations: {
        quality: 'auto:good',
        format: 'auto',
      },
    },
  },
  
  // Caching settings
  cache: {
    ttl: 300, // 5 minutes
    max: 100, // max 100 items
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  // Compression
  compression: {
    level: 6,
    threshold: 1024,
  },
}; 