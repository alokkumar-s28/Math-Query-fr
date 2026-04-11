require('dotenv').config({ path: '../backend/.env' });
const connectDB = require('./connection');
const Video = require('../backend/models/Video');
const Material = require('../backend/models/Material');
const LiveSession = require('../backend/models/LiveSession');

const seed = async () => {
    await connectDB();

    // Clear existing (optional)
    await Video.deleteMany({});
    await Material.deleteMany({});
    await LiveSession.deleteMany({});

    // Sample Videos
    await Video.create([
        { title: 'Quadratic Equations', description: 'Complete chapter', url: 'https://www.youtube.com/embed/abc123', order: 1 },
        { title: 'Trigonometry Basics', description: 'Sine, Cosine, Tangent', url: 'https://www.youtube.com/embed/def456', order: 2 }
    ]);

    // Sample Material
    await Material.create({
        title: 'Algebra Formula Sheet',
        description: 'All formulas for quick revision',
        fileUrl: 'uploads/materials/sample.pdf',
        fileType: 'application/pdf',
        fileSize: 102400
    });

    // Sample Live Session (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0);
    await LiveSession.create({
        title: 'Doubt Clearing Session',
        description: 'Ask any math question',
        scheduledAt: tomorrow,
        duration: 60,
        meetingLink: 'https://meet.google.com/xyz-abc'
    });

    console.log('✅ Sample data seeded');
    process.exit();
};

seed();