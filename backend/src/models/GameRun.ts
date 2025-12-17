import mongoose, { Schema, Document } from 'mongoose';

export interface IGameRun extends Document {
  userId: mongoose.Types.ObjectId;
  score: number;
  durationMs: number;
  createdAt: Date;
}

const GameRunSchema = new Schema<IGameRun>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, required: true, min: 0 },
    durationMs: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

GameRunSchema.index({ createdAt: -1 });

const GameRun = mongoose.model<IGameRun>('GameRun', GameRunSchema);
export default GameRun;
