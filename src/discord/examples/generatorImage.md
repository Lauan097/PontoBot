**Exemplo do gerador de imagem que eu quero**

- Esse ai eu usava em um projeto de abril de 2025 em javascript, mas fazia a mesma função basicamente.

## Função que gera a imagem:

```js
const sharp = require('sharp');
const { AttachmentBuilder } = require('discord.js');
const path = require('path');
const axios = require('axios');
const { getGuildIconGradientPalette } = require('./avatarColor.js');

async function criarImagemPainel(guild) {
    const ICON_DIAMETER = 118;
    const ICON_X = 40.5, ICON_Y = 16.5;

    try {
        const imagePath = path.join(__dirname, '../imagens/banner_base_.png');
        const metadata = await sharp(imagePath).metadata();
        const { width, height } = metadata;
        const colors = await getGuildIconGradientPalette(guild);
        const gradientStops = colors.map((color, index) => {
            const offset = (index / (colors.length - 1)) * 100;
            return `<stop offset="${offset}%" style="stop-color:${color};" />`;
        }).join('');

        const gradientSvg = Buffer.from(`
            <svg width="${width}" height="${height}">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        ${gradientStops}
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad)" />
            </svg>
        `);

        let circularIconBuffer;
        const iconURL = guild.iconURL({ extension: 'png', size: 256 });
        if (iconURL) {
            const iconResponse = await axios.get(iconURL, { responseType: 'arraybuffer' });
            const circleMask = Buffer.from(`<svg><circle cx="${ICON_DIAMETER / 2}" cy="${ICON_DIAMETER / 2}" r="${ICON_DIAMETER / 2}" /></svg>`);
            
            circularIconBuffer = await sharp(iconResponse.data)
                .resize(ICON_DIAMETER, ICON_DIAMETER)
                .composite([{ input: circleMask, blend: 'dest-in' }])
                .png()
                .toBuffer();
        }
        
        const finalImageBuffer = await sharp(gradientSvg)
            .composite([
                { input: imagePath },
                ...(circularIconBuffer ? [{ input: circularIconBuffer, top: Math.round(ICON_Y), left: Math.round(ICON_X)  }] : []),
            ])
            .png()
            .toBuffer();

        return new AttachmentBuilder(finalImageBuffer, { name: 'painel-servidor.png' });

    } catch (error) {
        console.error("Erro ao gerar imagem com Sharp:", error);
        return null; 
    }
}

module.exports = {
    criarImagemPainel
};
```

## Função que pega o gradiente de cores pro fundo:

```js
const getPixels = require('get-pixels');
const quantize = require('quantize');
const axios = require('axios');
const util = require('util');

const getPixelsAsync = util.promisify(getPixels);

async function getIconColors(iconURL) {
    const fallback = {
        dominant: [44, 47, 51],
        gradient: ['#5865F2', '#7289DA', '#4E5D94', '#2C2F33', '#232A']
    };
    if (!iconURL) return fallback;

    try {
        const buffer = await axios.get(iconURL, { responseType: 'arraybuffer' }).then(res => res.data);
        
        const pixelsData = await getPixelsAsync(buffer);
        const pixelArray = [];
        for (let i = 0; i < pixelsData.data.length; i += 4) {
            pixelArray.push([pixelsData.data[i], pixelsData.data[i + 1], pixelsData.data[i + 2]]);
        }

        const colorMap = quantize(pixelArray, 6);
        const palette = colorMap.palette();
        const dominantColor = palette[0];
        const gradientPalette = palette.slice(0, 5).map(rgb => `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`);

        return { dominant: dominantColor, gradient: gradientPalette };

    } catch (error) {
        console.error(`[getIconColors] Erro ao processar imagem:`, error);
        return fallback;
    }
}

let colorCache = {};
setInterval(() => { colorCache = {}; }, 1000 * 60 * 5);

async function getColorsForGuild(guild) {
    const iconURL = guild?.iconURL({ extension: 'png', size: 128 });
    if (!iconURL) return getIconColors(null);
    
    if (colorCache[guild.id]) return colorCache[guild.id];
    
    const colors = await getIconColors(iconURL);
    colorCache[guild.id] = colors;
    return colors;
}

async function getGuildIconDominantColor(guild) {
    const { dominant } = await getColorsForGuild(guild);
    const [r, g, b] = dominant;
    return (r << 16) + (g << 8) + b;
}

async function getGuildIconGradientPalette(guild) {
    const { gradient } = await getColorsForGuild(guild);
    return gradient;
}

async function getAvatarDominantColor(user) {
    const avatarURL = user.displayAvatarURL({ extension: 'png', size: 128 });
    const { dominant } = await getIconColors(avatarURL);
    const [r, g, b] = dominant;
    return (r << 16) + (g << 8) + b;
}

module.exports = {
    getAvatarDominantColor,
    getGuildIconDominantColor,
    getGuildIconGradientPalette
};
```

- Ai essa função ai eu usava ela pra pegar a cor dominante do ícone do servidor e gerar uma imagem com a cor dominante do ícone do servidor, ai fica bonitinho e talz, usa librarias como sharp pra gerar a imagem, get-pixels pra pegar os pixels da imagem e quantize pra gerar a cor dominante.