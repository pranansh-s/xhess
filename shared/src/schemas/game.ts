import { z } from 'zod';

export const PositionSchema = z.object({
  x: z.number().int().min(0).max(7),
  y: z.number().int().min(0).max(7),
});

export const MoveSchema = z.object({
  from: PositionSchema,
  to: PositionSchema,
});

export const GameConfigSchema = z.object({
  playerSide: z.enum(['white', 'black']),
  gameType: z.enum(['30m', '10m', '3m']),
});
