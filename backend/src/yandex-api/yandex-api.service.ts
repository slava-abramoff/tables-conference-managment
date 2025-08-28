import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class YandexApiService {
  private readonly axiosInstance: AxiosInstance;
  private readonly apiUrl: string = 'https://clck.ru/--';

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async shortenUrl(longUrl: string): Promise<string> {
    if (!longUrl || !this.isValidUrl(longUrl)) {
      throw new HttpException('Invalid URL provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await this.axiosInstance.get('', {
        params: { url: longUrl },
      });

      const shortUrl = response.data;

      if (
        !shortUrl ||
        typeof shortUrl !== 'string' ||
        !shortUrl.startsWith('https://clck.ru/')
      ) {
        throw new HttpException(
          'Failed to shorten URL: Invalid response from API',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return shortUrl;
    } catch (error) {
      throw new HttpException(
        `Failed to shorten URL: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
