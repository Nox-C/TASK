import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Decimal } from "@prisma/client/runtime/library";
import { AppModule } from "./app.module";

// Global Decimal serialization interceptor
class DecimalSerializationInterceptor {
  intercept(context: any, next: any) {
    return next.handle().pipe(
      // Convert Decimal objects to strings for JSON serialization
      map((data: any) =>
        JSON.parse(
          JSON.stringify(data, (key, value) => {
            return value instanceof Decimal ? value.toString() : value;
          }),
        ),
      ),
    );
  }
}

// Import RxJS operators for the interceptor
import { map } from "rxjs/operators";

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Enable CORS with dynamic origins
    const allowedOrigins = process.env.WEB_URL
      ? [process.env.WEB_URL]
      : ["http://localhost:3000", "http://localhost:3003"];

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });

    // Enable validation
    app.useGlobalPipes(new ValidationPipe());

    // Global Decimal to string conversion
    app.useGlobalInterceptors(new DecimalSerializationInterceptor());

    await app.listen(3002);
    console.log("🚀 API server running on http://localhost:3002");
  } catch (error) {
    console.error("❌ Failed to start API server:", error);
    process.exit(1);
  }
}
