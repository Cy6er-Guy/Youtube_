const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
    const scriptDir = './Script';
    const downloadDir = path.resolve('./voice');

    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
    }

    const files = fs.readdirSync(scriptDir)
        .filter(file => file.endsWith('.txt') && fs.statSync(path.join(scriptDir, file)).isFile())
        .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || 0, 10);
            const numB = parseInt(b.match(/\d+/)?.[0] || 0, 10);
            return numA - numB;
        });

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadDir
    });

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = fs.readFileSync(path.join(scriptDir, file), 'utf8');
        console.log(`Traitement du fichier : ${file}`);

        try {
            await page.goto('https://micmonster.com/');
            await page.waitForSelector('#languages', { visible: true });
            await page.click('#languages');
            await page.type('#languages', 'French (France)');
            await page.keyboard.press('Enter');

            await page.waitForSelector('#voices', { visible: true });
            await page.click('#voices');
            await page.type('#voices', 'Jacqueline');
            await page.keyboard.press('Enter');

            await page.waitForSelector('#app > div:nth-child(2) > section > div:nth-child(2) > textarea', { visible: true });
            await page.type('#app > div:nth-child(2) > section > div:nth-child(2) > textarea', content);
            await page.keyboard.press('Enter');

            await page.waitForSelector('#app > div:nth-child(2) > section > div:nth-child(2) > div.row-center-between.mt-2 > button', { visible: true });
            await page.click('#app > div:nth-child(2) > section > div:nth-child(2) > div.row-center-between.mt-2 > button');

            await page.waitForSelector('#app > div:nth-child(2) > section > div.container.upgrade-section > div.card.text-center.mx-auto.p-5.border-0 > button', { visible: true });
            await page.click('#app > div:nth-child(2) > section > div.container.upgrade-section > div.card.text-center.mx-auto.p-5.border-0 > button');

            console.log(`Téléchargement en cours pour ${file}`);
            await new Promise(resolve => setTimeout(resolve, 3000));

            const downloadedFiles = fs.readdirSync(downloadDir);
            const latestFile = downloadedFiles.reduce((latest, current) => {
                const latestTime = fs.statSync(path.join(downloadDir, latest)).mtime;
                const currentTime = fs.statSync(path.join(downloadDir, current)).mtime;
                return currentTime > latestTime ? current : latest;
            });
            const newFileName = path.join(downloadDir, `${i + 1}.mp3`);
            fs.renameSync(path.join(downloadDir, latestFile), newFileName);
            console.log(`Fichier enregistré sous : ${newFileName}`);
        } catch (error) {
            console.error(`Erreur lors du traitement du fichier ${file} :`, error);
        }
    }

    await browser.close();
}

run().catch(console.error);
