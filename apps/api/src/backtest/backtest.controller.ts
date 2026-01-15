import { Body, Controller, Get, Param, Post, Res } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BacktestConfig, BacktestService } from "./backtest.service";
import { BacktestReportingService } from "./reporting.service";

@Controller("backtest")
export class BacktestController {
  constructor(
    private readonly backtest: BacktestService,
    private readonly prisma: PrismaService,
    private readonly reporting: BacktestReportingService
  ) {}

  @Post("/run")
  async run(
    @Body()
    body: {
      symbol: string;
      fromTs?: string;
      toTs?: string;
      delayMs?: number;
      rules?: any[];
      persist?: boolean;
      startBalances?: any[];
      startPositions?: any[];
    }
  ) {
    const res = await this.backtest.runReplay(
      body.symbol,
      { fromTs: body.fromTs, toTs: body.toTs, delayMs: body.delayMs },
      body.rules || [],
      {
        persist: !!body.persist,
        startBalances: body.startBalances,
        startPositions: body.startPositions,
      }
    );
    return res;
  }

  @Get("/:id/report")
  async report(@Param("id") id: string) {
    const run = await this.prisma.backtestRun.findUnique({
      where: { id } as any,
    });
    if (!run) return { error: "not found" };
    return {
      id: run.id,
      status: run.status,
      report: run.report,
      params: run.params,
      createdAt: run.createdAt,
    };
  }

  @Get("/:id/export.csv")
  async exportCsv(@Param("id") id: string, @Res() res: any) {
    try {
      const csv = await this.reporting.exportRunCsv(id);
      res.setHeader("content-type", "text/csv");
      res.send(csv);
    } catch (err: any) {
      res.statusCode = 404;
      res.send({ error: err.message });
    }
  }

  @Get("/:id/metrics")
  async metrics(@Param("id") id: string) {
    try {
      const m = await this.reporting.computeMetricsForRun(id);
      return m;
    } catch (err: any) {
      return { error: err.message };
    }
  }

  @Get("/:id/export-equity.csv")
  async exportEquity(@Param("id") id: string, @Res() res: any) {
    try {
      const csv = await this.reporting.exportPnlSeriesCsv(id);
      res.setHeader("content-type", "text/csv");
      res.send(csv);
    } catch (err: any) {
      res.statusCode = 404;
      res.send({ error: err.message });
    }
  }

  // Advanced Backtest Endpoint
  @Post("/advanced")
  async runAdvancedBacktest(@Body() config: BacktestConfig) {
    try {
      const result = await this.backtest.runAdvancedBacktest(config);
      return result;
    } catch (error: any) {
      return { error: error.message };
    }
  }
}
