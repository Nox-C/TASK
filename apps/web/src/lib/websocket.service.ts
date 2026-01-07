import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
  change24h?: number;
  volume24h?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket;
  private priceUpdateSubject = new Subject<PriceUpdate>();
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private readonly wsUrl = 'ws://localhost:3001';

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnectedSubject.next(true);
        // Subscribe to default pairs on connect
        this.subscribeToPairs([
          'btcusdt', 'ethusdt', 'bnbusdt', 'solusdt', 'xrpusdt',
          'adausdt', 'dogeusdt', 'dotusdt', 'maticusdt', 'avaxusdt'
        ]);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'market.price') {
            this.priceUpdateSubject.next({
              symbol: data.data.symbol,
              price: data.data.price,
              timestamp: data.data.timestamp
            });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnectedSubject.next(false);
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.socket.close();
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      // Exponential backoff
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error('Max reconnection attempts reached. Please check your connection.');
    }
  }

  public getPriceUpdates(): Observable<PriceUpdate> {
    return this.priceUpdateSubject.asObservable();
  }

  public getConnectionStatus(): Observable<boolean> {
    return this.isConnectedSubject.asObservable();
  }

  public subscribeToPairs(pairs: string[]): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        event: 'subscribe',
        data: { pairs }
      }));
    } else {
      console.warn('WebSocket not connected. Subscription queued for when connection is established.');
      // Queue the subscription for when the connection is re-established
      const subscription = this.isConnectedSubject.subscribe(connected => {
        if (connected) {
          this.subscribeToPairs(pairs);
          subscription.unsubscribe();
        }
      });
    }
  }

  public unsubscribeFromPairs(pairs: string[]): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        event: 'unsubscribe',
        data: { pairs }
      }));
    }
  }

  public closeConnection(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
