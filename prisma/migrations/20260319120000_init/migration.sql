CREATE TABLE IF NOT EXISTS "metrics" (
  "id" SERIAL NOT NULL,
  "time_date" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "model" TEXT NOT NULL,
  "energy_demand" JSONB,
  "inst_power" JSONB,
  "elec_measurements" JSONB,
  CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "metrics_model_time_date_idx" ON "metrics" ("model", "time_date" DESC);
CREATE INDEX IF NOT EXISTS "metrics_energy_demand_idx" ON "metrics" ("model", "time_date" DESC) WHERE "energy_demand" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "metrics_inst_power_idx" ON "metrics" ("model", "time_date" DESC) WHERE "inst_power" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "metrics_elec_measurements_idx" ON "metrics" ("model", "time_date" DESC) WHERE "elec_measurements" IS NOT NULL;
