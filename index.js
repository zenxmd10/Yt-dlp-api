const express = require('express');
const { exec, spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
let publicUrl = 'Tunnel Starting...';

// CORS & Headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

// Root Endpoint - Cloudflare Direct URL kaanikkaan
app.get('/', (req, res) => {
    res.json({
        status: true,
        message: "YTDL Extractor API is Live!",
        current_public_url: publicUrl,
        usage: `${publicUrl}/api/download?url=YOUR_YOUTUBE_URL`
    });
});

// YTDL Download Endpoint
app.get('/api/download', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ status: false, error: 'URL query parameter is required' });
    }

    const command = `yt-dlp --js-runtimes quickjs -f "b[ext=mp4]/b" --extractor-args "youtube:player_client=web,android" -j "${videoUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ status: false, error: 'yt-dlp failed', details: stderr || error.message });
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
            res.status(500).json({ status: false, error: 'JSON parse error' });
        }
    });
});

// Server Start Cheytha Sesham Automatic Cloudflare Tunnel Trigger Cheyyunnu
app.listen(PORT, () => {
    console.log(`[LOCAL] Server running on http://localhost:${PORT}`);

    // Node.js process-il ninnu direct cloudflared trigger cheyyunnu
    const tunnel = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${PORT}`]);

    tunnel.stderr.on('data', (data) => {
        const output = data.toString();
        // Log-il ninnu trycloudflare URL parse cheyyunnu
        const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        if (match) {
            publicUrl = match[0];
            console.log('\n==================================================');
            console.log(`[PUBLIC API URL]: ${publicUrl}`);
            console.log(`[USAGE]: ${publicUrl}/api/download?url=YOUR_URL`);
            console.log('==================================================\n');
        }
    });
});
                                           
