import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { StrategyService } from "./strategy.service";

@Controller("strategy")
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Get("templates")
  async getTemplates() {
    return {
      message: "Available strategy templates",
      templates: await this.strategyService.getTemplates(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get("templates/:id")
  async getTemplate(id: string) {
    const template = await this.strategyService.getTemplate(id);
    if (!template) {
      return {
        message: "Strategy template not found",
        template: null,
        timestamp: new Date().toISOString(),
      };
    }
    return {
      message: "Strategy template retrieved",
      template,
      timestamp: new Date().toISOString(),
    };
  }

  @Post("create")
  async createCustomStrategy(@Body() strategyData: any) {
    try {
      const validation = await this.strategyService.validateStrategy(
        strategyData
      );
      if (!validation.valid) {
        return {
          message: "Strategy validation failed",
          errors: validation.errors,
          timestamp: new Date().toISOString(),
        };
      }

      const strategy = await this.strategyService.createCustomStrategy(
        strategyData
      );
      return {
        message: "Custom strategy created successfully",
        strategy,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: "Failed to create custom strategy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post("indicators")
  async calculateIndicators(
    @Body() body: { symbol: string; timeframe: string; limit?: number }
  ) {
    try {
      const indicators =
        await this.strategyService.calculateTechnicalIndicators(
          body.symbol,
          body.timeframe,
          body.limit || 100
        );

      return {
        message: "Technical indicators calculated",
        indicators,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: "Failed to calculate indicators",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Simple Strategy CRUD Endpoints (consolidated from strategies/ directory)
  @Post()
  async createStrategy(@Body() body: { name: string; description: string }) {
    const strategy = await this.strategyService.createSimpleStrategy(
      body.name,
      body.description
    );
    return {
      message: "Strategy created successfully",
      strategy,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async getAllStrategies() {
    const strategies = await this.strategyService.findAllStrategies();
    return {
      message: "Available strategies",
      strategies,
      count: strategies.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(":id")
  async getStrategy(@Param("id") id: string) {
    const strategy = await this.strategyService.findStrategyById(id);
    return {
      message: "Strategy found",
      strategy,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(":id")
  async updateStrategy(
    @Param("id") id: string,
    @Body() body: { name?: string; description?: string }
  ) {
    const strategy = await this.strategyService.updateStrategy(id, body);
    return {
      message: "Strategy updated successfully",
      strategy,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(":id")
  async deleteStrategy(@Param("id") id: string) {
    await this.strategyService.deleteStrategy(id);
    return {
      message: "Strategy deleted successfully",
      timestamp: new Date().toISOString(),
    };
  }
}
