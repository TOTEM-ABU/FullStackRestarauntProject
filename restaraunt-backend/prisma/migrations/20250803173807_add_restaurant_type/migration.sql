-- CreateEnum
CREATE TYPE "RestaurantType" AS ENUM ('FAST_FOOD', 'CAFE', 'RESTAURANT', 'PIZZERIA', 'SUSHI_BAR', 'OTHER');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "type" "RestaurantType" NOT NULL DEFAULT 'RESTAURANT';
