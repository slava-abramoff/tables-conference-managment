import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLogger extends Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  log(message: string, context?: string, method?: string) {
    const timestamp = this.getTimestamp();
    const formattedMessage = method 
      ? `[${timestamp}] ${message} [Method: ${method}]` 
      : `[${timestamp}] ${message}`;
    super.log(formattedMessage, context);
  }

  error(message: string, trace?: string, context?: string, method?: string) {
    const timestamp = this.getTimestamp();
    const formattedMessage = method 
      ? `[${timestamp}] ${message} [Method: ${method}]` 
      : `[${timestamp}] ${message}`;
    super.error(formattedMessage, trace, context);
  }

  warn(message: string, context?: string, method?: string) {
    const timestamp = this.getTimestamp();
    const formattedMessage = method 
      ? `[${timestamp}] ${message} [Method: ${method}]` 
      : `[${timestamp}] ${message}`;
    super.warn(formattedMessage, context);
  }

  debug(message: string, context?: string, method?: string) {
    const timestamp = this.getTimestamp();
    const formattedMessage = method 
      ? `[${timestamp}] ${message} [Method: ${method}]` 
      : `[${timestamp}] ${message}`;
    super.debug(formattedMessage, context);
  }

  verbose(message: string, context?: string, method?: string) {
    const timestamp = this.getTimestamp();
    const formattedMessage = method 
      ? `[${timestamp}] ${message} [Method: ${method}]` 
      : `[${timestamp}] ${message}`;
    super.verbose(formattedMessage, context);
  }
}