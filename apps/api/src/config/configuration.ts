import type { EnvConfig } from "./env.schema";

export default () => {
  const parsed: EnvConfig = {
    NODE_ENV: (process.env.NODE_ENV as EnvConfig["NODE_ENV"]) ?? "development",
    PORT: Number(process.env.PORT ?? 3001),
    API_PREFIX: process.env.API_PREFIX ?? "v1",
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    LOG_LEVEL: (process.env.LOG_LEVEL as EnvConfig["LOG_LEVEL"]) ?? "info",
  };

  return {
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    apiPrefix: parsed.API_PREFIX,
    databaseUrl: parsed.DATABASE_URL,
    redisUrl: parsed.REDIS_URL,
    jwtAccessSecret: parsed.JWT_ACCESS_SECRET,
    logLevel: parsed.LOG_LEVEL,
    ethRpcUrlSepolia: process.env.ETH_RPC_URL_SEPOLIA,
    ethRpcUrlMainnet: process.env.ETH_RPC_URL_MAINNET,
  };
};
