const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Enrollment = require('../models/Enrollment');
const Video = require('../models/Video');
const Material = require('../models/Material');
const LiveSession = require('../models/LiveSession');

const router = express.Router();

// ------------------ Multer Config ------------------
const paymentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/screenshots';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only images allowed'));
};
const upload = multer({ storage: paymentStorage, limits: { fileSize: 5*1024*1024 }, fileFilter });

const contentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = file.fieldname === 'thumbnail' ? './uploads/thumbnails' : './uploads/materials';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const contentUpload = multer({ storage: contentStorage, limits: { fileSize: 50*1024*1024 } });

// ------------------ Admin Middleware ------------------
const verifyAdmin = (req, res, next) => {
    const key = req.headers['x-admin-key'];
    if (key && key === process.env.ADMIN_SECRET_KEY) next();
    else res.status(401).json({ success: false, message: 'Unauthorized' });
};

// ------------------ Enrollment Routes ------------------
router.post('/enroll', upload.single('paymentScreenshot'), async (req, res) => {
    try {
        const { fullName, email, phone, board, upiId } = req.body;
        if (!fullName || !email || !phone || !upiId || !req.file) {
            return res.status(400).json({ success: false, message: 'All fields and screenshot required' });
        }
        const existing = await Enrollment.findOne({ phone });
        if (existing) return res.status(400).json({ success: false, message: 'Phone already enrolled' });

        const enrollment = new Enrollment({
            fullName, email, phone, board, upiId,
            screenshotPath: req.file.path
        });
        await enrollment.save();
        res.status(201).json({ success: true, message: 'Enrollment submitted', data: { enrollmentId: enrollment._id, fullName: enrollment.fullName, status: enrollment.status } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/enrollment/:phone', async (req, res) => {
    const enrollment = await Enrollment.findOne({ phone: req.params.phone }).select('-screenshotPath');
    if (!enrollment) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: enrollment });
});

router.get('/admin/enrollments', verifyAdmin, async (req, res) => {
    const enrollments = await Enrollment.find().sort({ enrollmentDate: -1 });
    res.json({ success: true, count: enrollments.length, data: enrollments });
});

router.put('/admin/enrollment/:id/status', verifyAdmin, async (req, res) => {
    const { status } = req.body;
    if (!['pending','confirmed','rejected'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, data: enrollment });
});

// ------------------ Public Content ------------------
router.get('/videos', async (req, res) => {
    const videos = await Video.find({ isPublished: true }).sort({ order: 1 });
    res.json({ success: true, data: videos });
});
router.get('/materials', async (req, res) => {
    const materials = await Material.find({ isPublished: true }).sort({ order: 1 });
    res.json({ success: true, data: materials });
});
router.get('/live-sessions', async (req, res) => {
    const now = new Date();
    const sessions = await LiveSession.find({ isActive: true, scheduledAt: { $gte: now } }).sort({ scheduledAt: 1 });
    res.json({ success: true, data: sessions });
});

// ------------------ Admin CMS (Videos) ------------------
router.get('/admin/videos', verifyAdmin, async (req, res) => {
    res.json({ success: true, data: await Video.find().sort({ order: 1 }) });
});
router.post('/admin/videos', verifyAdmin, async (req, res) => {
    const video = new Video(req.body);
    await video.save();
    res.status(201).json({ success: true, data: video });
});
router.put('/admin/videos/:id', verifyAdmin, async (req, res) => {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: video });
});
router.delete('/admin/videos/:id', verifyAdmin, async (req, res) => {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// ------------------ Admin CMS (Materials) ------------------
router.get('/admin/materials', verifyAdmin, async (req, res) => {
    res.json({ success: true, data: await Material.find().sort({ order: 1 }) });
});
router.post('/admin/materials', verifyAdmin, contentUpload.single('file'), async (req, res) => {
    const data = { ...req.body };
    if (req.file) {
        data.fileUrl = req.file.path;
        data.fileType = req.file.mimetype;
        data.fileSize = req.file.size;
    }
    const material = new Material(data);
    await material.save();
    res.status(201).json({ success: true, data: material });
});
router.put('/admin/materials/:id', verifyAdmin, contentUpload.single('file'), async (req, res) => {
    const update = { ...req.body };
    if (req.file) {
        update.fileUrl = req.file.path;
        update.fileType = req.file.mimetype;
        update.fileSize = req.file.size;
    }
    const material = await Material.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: material });
});
router.delete('/admin/materials/:id', verifyAdmin, async (req, res) => {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// ------------------ Admin CMS (Live Sessions) ------------------
router.get('/admin/live-sessions', verifyAdmin, async (req, res) => {
    res.json({ success: true, data: await LiveSession.find().sort({ scheduledAt: -1 }) });
});
router.post('/admin/live-sessions', verifyAdmin, async (req, res) => {
    const session = new LiveSession(req.body);
    await session.save();
    res.status(201).json({ success: true, data: session });
});
router.put('/admin/live-sessions/:id', verifyAdmin, async (req, res) => {
    const session = await LiveSession.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: session });
});
router.delete('/admin/live-sessions/:id', verifyAdmin, async (req, res) => {
    await LiveSession.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

module.exports = router;