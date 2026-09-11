const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and Custom Headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("X-Pinggy-No-Page", "true");
    next();
});

// Root API Welcome / Status Endpoint
app.get('/', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${protocol}://${host}`;

    res.json({
        status: true,
        message: "YTDL Extractor API is Live",
        usage: `${baseUrl}/api/download?url=YOUR_YOUTUBE_URL`
    });
});

// Primary Video Extraction Endpoint
app.get('/api/download', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ 
            status: false, 
            error: 'URL parameter is missing. Usage: /api/download?url=VIDEO_URL' 
        });
    }

    // Command optimized with quickjs and client extractors to bypass bot detection
    const command = `yt-dlp --js-runtimes quickjs -f "b[ext=mp4]/b" --extractor-args "youtube:player_client=web,android" -j "${videoUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ 
                status: false, 
                error: 'Failed to extract video data', 
                details: stderr || error.message 
            });
        }

        try {
            const data = JSON.parse(stdout);
            
            res.json({
                status: true,
                title: data.title,
                thumbnail: data.thumbnail,
                duration: data.duration,
                download_url: data.url || (data.formats && data.formats.slice(-1)[0].url)
            });
        } catch (e) {
            res.status(500).json({ 
                status: false, 
                error: 'Error parsing video output JSON' 
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
                       
