import mongoose from 'mongoose';

const scanJobSchema = new mongoose.Schema(
  {
    target: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending'
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    error: { type: String }
  },
  { timestamps: true }
);

// index status so filtering by it stays fast as jobs pile up
scanJobSchema.index({ status: 1 });
scanJobSchema.index({ startedAt: -1 });

export default mongoose.model('ScanJob', scanJobSchema);
