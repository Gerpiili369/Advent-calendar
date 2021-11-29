// Modules
import fs from 'fs';
import path from 'path';
import express from 'express';
import { Webhook } from 'discord-webhook-node';
import { fileURLToPath } from 'url';
const
    // Environment variables
    IMG_FOLDER = process.env.IMG_FOLDER || fileURLToPath(new URL('img', import.meta.url)),
    PORT = process.env.PORT || 3000,
    WEBHOOK_URL = process.env.WEBHOOK_URL,
    app = express(),
    webhook = WEBHOOK_URL ? new Webhook(WEBHOOK_URL) : { sendFile: () => {} },
    // Other stuff
    mime = {
        gif: 'image/gif',
        jpg: 'image/jpeg',
        png: 'image/png',
        svg: 'image/svg+xml',
    };

fs.readdir(IMG_FOLDER, (err, files) => {
    if (err) console.error(err);
    else {
        // Create and populate new set of images from files.
        const imageSet = new Set();
        while (imageSet.size < files.length) imageSet.add(files[Math.floor(Math.random() * files.length)]);
        const imageArray = Array.from(imageSet);

        let file = path.join(IMG_FOLDER, imageArray[0]);

        // Save start date
        const startDate = new Date();
        // Set timers for all of the days.
        for (let day = 1; day <= 24; day++) setTimeout(day => {
            console.log(`It is day #${day}`);
            file = path.join(IMG_FOLDER, imageArray[day]),
            webhook.sendFile(file);
        }, new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + day, 6) - startDate, day)

        app.get('/', (req, res) => res.sendFile(fileURLToPath(new URL('index.html', import.meta.url))));
        app.get('/daily', (req, res) => {
            const
                type = mime[path.extname(file).slice(1)] || 'text/plain',
                stream = fs.createReadStream(file);

            stream.on('open', () => {
                res.set('Content-Type', type);
                stream.pipe(res);
            });
            stream.on('error', () => {
                res.set('Content-Type', 'text/plain');
                res.status(500).end('Nonono');
            });
        });
    }
});

app.listen(PORT, () => console.log('Hohoho'));
