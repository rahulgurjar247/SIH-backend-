// Enhanced logging utility for better debugging and monitoring

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.formatTimestamp();
    const baseMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      return `${baseMessage}\n${JSON.stringify(data, null, 2)}`;
    }
    
    return baseMessage;
  }

  info(message, data = null) {
    const formattedMessage = this.formatMessage('info', message, data);
    if (this.isDevelopment) {
      console.log(`${colors.blue}${formattedMessage}${colors.reset}`);
    } else {
      console.log(formattedMessage);
    }
  }

  success(message, data = null) {
    const formattedMessage = this.formatMessage('success', message, data);
    if (this.isDevelopment) {
      console.log(`${colors.green}${formattedMessage}${colors.reset}`);
    } else {
      console.log(formattedMessage);
    }
  }

  warn(message, data = null) {
    const formattedMessage = this.formatMessage('warn', message, data);
    if (this.isDevelopment) {
      console.log(`${colors.yellow}${formattedMessage}${colors.reset}`);
    } else {
      console.warn(formattedMessage);
    }
  }

  error(message, error = null, context = null) {
    const errorData = {
      message: error?.message || message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      ...context
    };

    const formattedMessage = this.formatMessage('error', message, errorData);
    
    if (this.isDevelopment) {
      console.error(`${colors.red}${formattedMessage}${colors.reset}`);
    } else {
      console.error(formattedMessage);
    }
  }

  debug(message, data = null) {
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage('debug', message, data);
      console.log(`${colors.cyan}${formattedMessage}${colors.reset}`);
    }
  }

  // API request logging
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user ? req.user._id : null,
      contentLength: res.get('Content-Length') || 0
    };

    if (res.statusCode >= 400) {
      this.error('API Request Error', null, logData);
    } else if (res.statusCode >= 300) {
      this.warn('API Request Redirect', logData);
    } else {
      this.info('API Request', logData);
    }
  }

  // Database operation logging
  logDatabaseOperation(operation, collection, query = null, result = null, error = null) {
    const logData = {
      operation,
      collection,
      query: query ? JSON.stringify(query) : null,
      resultCount: result ? (Array.isArray(result) ? result.length : 1) : null,
      error: error ? error.message : null
    };

    if (error) {
      this.error(`Database ${operation} Error`, error, logData);
    } else {
      this.info(`Database ${operation}`, logData);
    }
  }

  // Authentication logging
  logAuth(action, userId = null, success = true, error = null) {
    const logData = {
      action,
      userId,
      success,
      error: error ? error.message : null,
      timestamp: this.formatTimestamp()
    };

    if (success) {
      this.info(`Authentication ${action}`, logData);
    } else {
      this.error(`Authentication ${action} Failed`, error, logData);
    }
  }

  // File upload logging
  logFileUpload(filename, size, mimetype, success = true, error = null) {
    const logData = {
      filename,
      size: `${(size / 1024 / 1024).toFixed(2)}MB`,
      mimetype,
      success,
      error: error ? error.message : null
    };

    if (success) {
      this.info('File Upload Success', logData);
    } else {
      this.error('File Upload Failed', error, logData);
    }
  }

  // Performance logging
  logPerformance(operation, duration, details = null) {
    const logData = {
      operation,
      duration: `${duration}ms`,
      ...details
    };

    if (duration > 1000) {
      this.warn('Slow Operation', logData);
    } else {
      this.info('Performance', logData);
    }
  }

  // Security logging
  logSecurity(event, details = null) {
    const logData = {
      event,
      timestamp: this.formatTimestamp(),
      ...details
    };

    this.warn('Security Event', logData);
  }

  // System logging
  logSystem(event, details = null) {
    const logData = {
      event,
      timestamp: this.formatTimestamp(),
      ...details
    };

    this.info('System Event', logData);
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;

// Export individual methods for convenience
export const {
  info,
  success,
  warn,
  error,
  debug,
  logRequest,
  logDatabaseOperation,
  logAuth,
  logFileUpload,
  logPerformance,
  logSecurity,
  logSystem
} = logger;
