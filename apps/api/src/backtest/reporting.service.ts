import Decimal from "decimal.js";
import { PrismaService } from "../prisma/prisma.service";

export class BacktestReportingService {
  constructor(private readonly prisma: PrismaService) {}

  async computeMetricsForRun(backtestRunId: string) {
    const run = await this.prisma.backtestRun.findUnique({
      where: { id: backtestRunId } as any,
    });
    if (!run) throw new Error("backtest run not found");

    const report = run.report as any;

    // Extract fills (from persisted run if available)
    const fills = report.fills || [];

    // Build PnL time series: assume each fill has ts and price and qty
    const series: Array<{ ts: string; pnl: string; equity: string }> = [];

    // compute equity series from fills using initial capital (if provided in params) else assume 10000
    const params = run.params as any;
    const initialCapital =
      (params && params.startBalances && Array.isArray(params.startBalances)
        ? params.startBalances.find((b: any) => b.asset === "USD")?.amount
        : undefined) || 10000;

    let equity = new Decimal(initialCapital);
    let cumulative = new Decimal(0);
    for (const f of fills.sort(
      (a: any, b: any) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
    )) {
      const qty = new Decimal(f.qty as any);
      const price = new Decimal(f.price as any);
      // buy reduces equity, sell increases equity
      const tradeValue = price.mul(qty);
      if (qty.gt(0)) {
        // treat positive qty as buy
        equity = equity.sub(tradeValue);
      } else {
        equity = equity.add(tradeValue.abs());
      }
      cumulative = equity;
      series.push({ ts: f.ts, pnl: "0", equity: equity.toFixed(10) });
    }

    // compute high-water mark and drawdown
    let peak = new Decimal(-Infinity);
    let maxDd = new Decimal(0);
    for (const p of series) {
      const v = new Decimal(p.equity);
      if (v.gt(peak) || peak.eq(-Infinity)) peak = v;
      const dd = peak.sub(v);
      if (dd.gt(maxDd)) maxDd = dd;
    }

    // compute total & percent returns
    const finalEquity = series.length
      ? new Decimal(series[series.length - 1].equity)
      : new Decimal(initialCapital);
    const totalReturn = finalEquity.sub(initialCapital);
    const pctReturn = initialCapital
      ? totalReturn.div(initialCapital)
      : new Decimal(0);

    // compute annualized return (approx) using time between first and last fill
    let annualized = new Decimal(0);
    if (series.length >= 2) {
      const start = new Date(series[0].ts).getTime();
      const end = new Date(series[series.length - 1].ts).getTime();
      const days = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
      const years = days / 365;
      try {
        annualized = new Decimal(1)
          .add(pctReturn)
          .pow(new Decimal(1).div(years))
          .sub(1);
      } catch (e) {
        annualized = new Decimal(0);
      }
    }

    const metrics = {
      trades: fills.length,
      pnlSeries: series,
      maxDrawdown: maxDd.toFixed(10),
      initialCapital: new Decimal(initialCapital).toFixed(10),
      finalEquity: finalEquity.toFixed(10),
      totalReturn: totalReturn.toFixed(10),
      pctReturn: pctReturn.toFixed(10),
      annualizedReturn: annualized.toFixed(10),
    };

    return metrics;
  }

  async exportRunCsv(backtestRunId: string) {
    const run = await this.prisma.backtestRun.findUnique({
      where: { id: backtestRunId } as any,
    });
    if (!run) throw new Error("backtest run not found");
    const report = run.report as any;
    const fills = report.fills || [];

    // simple CSV: id,symbol,qty,price,ts
    const header = "id,symbol,qty,price,ts\n";
    const rows = fills
      .map((f: any) => `${f.id},${f.symbol},${f.qty},${f.price},${f.ts}`)
      .join("\n");
    return header + rows;
  }

  async exportPnlSeriesCsv(backtestRunId: string) {
    const run = await this.prisma.backtestRun.findUnique({
      where: { id: backtestRunId } as any,
    });
    if (!run) throw new Error("backtest run not found");
    const report = run.report as any;
    const fills = report.fills || [];

    // compute series same as metrics helper (avoid duplication by calling computeMetricsForRun)
    const metrics = await this.computeMetricsForRun(backtestRunId);
    const series = metrics.pnlSeries || [];
    const header = "ts,equity\n";
    const rows = series.map((s: any) => `${s.ts},${s.equity}`).join("\n");
    return header + rows;
  }
}
