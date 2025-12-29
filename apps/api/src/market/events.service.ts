import { Injectable } from '@nestjs/common';
import EventEmitter from 'events';

@Injectable()
export class MarketEventsService {
  private readonly emitter = new EventEmitter();

  emitTick(tick: { symbol: string; price: string | number; ts?: string | Date }) {
    this.emitter.emit('tick', tick);
  }

  onTick(cb: (tick: { symbol: string; price: string | number; ts?: string | Date }) => void) {
    this.emitter.on('tick', cb);
    return () => this.emitter.removeListener('tick', cb);
  }
}
