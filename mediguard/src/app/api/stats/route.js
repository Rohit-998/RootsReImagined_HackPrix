import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import ScanLog from '../../../models/ScanLog';
import Medicine from '../../../models/Medicine';
import Report from '../../../models/Report';

// GET /api/stats — Analytics and statistics dashboard data
export async function GET() {
  try {
    await connectDB();

    // Overall scan stats
    const totalScans = await ScanLog.countDocuments();
    const totalMedicines = await Medicine.countDocuments();

    // Verdict distribution from scan scores
    const verdictStats = await ScanLog.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          verified: { $sum: { $cond: [{ $gte: ['$result_score', 80] }, 1, 0] } },
          suspicious: { $sum: { $cond: [{ $and: [{ $gte: ['$result_score', 40] }, { $lt: ['$result_score', 80] }] }, 1, 0] } },
          counterfeit: { $sum: { $cond: [{ $lt: ['$result_score', 40] }, 1, 0] } },
          avg_score: { $avg: '$result_score' },
        }
      }
    ]);

    // Scans per region/city
    const scansByCity = await ScanLog.aggregate([
      { $match: { location_city: { $ne: null } } },
      {
        $group: {
          _id: '$location_city',
          count: { $sum: 1 },
          avg_score: { $avg: '$result_score' },
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Scans over time (last 7 days, grouped by day)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const scansOverTime = await ScanLog.aggregate([
      { $match: { scanned_at: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$scanned_at' }
          },
          count: { $sum: 1 },
          avg_score: { $avg: '$result_score' },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most scanned medicines
    const topMedicines = await ScanLog.aggregate([
      { $match: { medicine_id: { $ne: null } } },
      {
        $group: {
          _id: '$medicine_id',
          scan_count: { $sum: 1 },
          batch_id: { $first: '$scanned_batch_id' },
          avg_score: { $avg: '$result_score' },
        }
      },
      { $sort: { scan_count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine'
        }
      },
      { $unwind: { path: '$medicine', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          medicine_name: '$medicine.name',
          batch_id: 1,
          scan_count: 1,
          avg_score: { $round: ['$avg_score', 1] },
        }
      }
    ]);

    // Recall stats
    const recalledBatches = await Medicine.countDocuments({ recalled: true });

    // Report stats
    const reportStats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        }
      }
    ]);
    const reportsByStatus = {};
    for (const r of reportStats) {
      reportsByStatus[r._id] = r.count;
    }

    // Counterfeit detection rate
    const vStats = verdictStats[0] || { total: 0, verified: 0, suspicious: 0, counterfeit: 0, avg_score: 0 };
    const detectionRate = vStats.total > 0
      ? ((vStats.counterfeit + vStats.suspicious) / vStats.total * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      overview: {
        total_scans: totalScans,
        total_medicines_in_db: totalMedicines,
        average_trust_score: Math.round(vStats.avg_score || 0),
        counterfeit_detection_rate: `${detectionRate}%`,
        recalled_batches: recalledBatches,
      },
      verdicts: {
        verified: vStats.verified,
        suspicious: vStats.suspicious,
        counterfeit: vStats.counterfeit,
      },
      scans_by_city: scansByCity,
      scans_over_time: scansOverTime,
      top_medicines: topMedicines,
      reports: reportsByStatus,
    }, { status: 200 });

  } catch (error) {
    console.error("Error generating stats:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
