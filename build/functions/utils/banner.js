import sharp from "sharp";
import { AttachmentBuilder } from "discord.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_GRADIENT = ["#5865F2", "#7289DA", "#4E5D94", "#2C2F33", "#23272a"];
const colorCache = /* @__PURE__ */ new Map();
setInterval(() => {
  colorCache.clear();
}, 1e3 * 60 * 5);
function kMeans(pixels, k, maxIterations = 10) {
  if (pixels.length === 0) return [];
  if (pixels.length <= k) return pixels;
  let centroids = [];
  for (let i = 0; i < k; i++) {
    const index = Math.floor(i / k * pixels.length);
    centroids.push([...pixels[index]]);
  }
  for (let iter = 0; iter < maxIterations; iter++) {
    const clusters = Array.from({ length: k }, () => []);
    for (const pixel of pixels) {
      let minDistance = Infinity;
      let closestIndex = 0;
      for (let i = 0; i < k; i++) {
        const centroid = centroids[i];
        const dist = Math.pow(pixel[0] - centroid[0], 2) + Math.pow(pixel[1] - centroid[1], 2) + Math.pow(pixel[2] - centroid[2], 2);
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = i;
        }
      }
      clusters[closestIndex].push(pixel);
    }
    let centroidsChanged = false;
    const nextCentroids = [];
    for (let i = 0; i < k; i++) {
      const cluster = clusters[i];
      if (cluster.length === 0) {
        nextCentroids.push(centroids[i]);
        continue;
      }
      let sumR = 0, sumG = 0, sumB = 0;
      for (const p of cluster) {
        sumR += p[0];
        sumG += p[1];
        sumB += p[2];
      }
      const meanR = Math.round(sumR / cluster.length);
      const meanG = Math.round(sumG / cluster.length);
      const meanB = Math.round(sumB / cluster.length);
      const nextCentroid = [meanR, meanG, meanB];
      if (nextCentroid[0] !== centroids[i][0] || nextCentroid[1] !== centroids[i][1] || nextCentroid[2] !== centroids[i][2]) {
        centroidsChanged = true;
      }
      nextCentroids.push(nextCentroid);
    }
    centroids = nextCentroids;
    if (!centroidsChanged) break;
  }
  centroids.sort((a, b) => {
    const lumA = 0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2];
    const lumB = 0.299 * b[0] + 0.587 * b[1] + 0.114 * b[2];
    return lumA - lumB;
  });
  return centroids;
}
async function getIconColors(iconURL) {
  if (!iconURL) return FALLBACK_GRADIENT;
  try {
    const response = await fetch(iconURL);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { data, info } = await sharp(buffer).resize(32, 32, { fit: "inside" }).raw().toBuffer({ resolveWithObject: true });
    const pixels = [];
    for (let i = 0; i < data.length; i += info.channels) {
      if (info.channels === 4 && data[i + 3] < 50) continue;
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
    const centroids = kMeans(pixels, 5);
    if (centroids.length === 0) return FALLBACK_GRADIENT;
    return centroids.map(
      ([r, g, b]) => "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")
    );
  } catch (error) {
    console.error("[getIconColors] Erro ao extrair cores do \xEDcone:", error);
    return FALLBACK_GRADIENT;
  }
}
async function getColorsForGuild(guild) {
  if (colorCache.has(guild.id)) {
    return colorCache.get(guild.id);
  }
  const iconURL = guild.iconURL({ extension: "png", size: 128 });
  const colors = await getIconColors(iconURL);
  colorCache.set(guild.id, colors);
  return colors;
}
async function criarImagemPainel(guild) {
  const ICON_DIAMETER = 118;
  const ICON_X = 40.5;
  const ICON_Y = 16.5;
  try {
    const imagePath = path.join(__dirname, "../../discord/images/banner_base.png");
    const metadata = await sharp(imagePath).metadata();
    const width = metadata.width ?? 800;
    const height = metadata.height ?? 200;
    const colors = await getColorsForGuild(guild);
    const gradientStops = colors.map((color, index) => {
      const offset = index / (colors.length - 1) * 100;
      return `<stop offset="${offset}%" style="stop-color:${color};" />`;
    }).join("");
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
    const iconURL = guild.iconURL({ extension: "png", size: 256 });
    let iconBuffer = null;
    if (iconURL) {
      try {
        const response = await fetch(iconURL);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          iconBuffer = Buffer.from(arrayBuffer);
        }
      } catch (error) {
        console.error("[criarImagemPainel] Erro ao carregar \xEDcone do servidor:", error);
      }
    }
    if (!iconBuffer) {
      try {
        const fallbackIconPath = path.join(__dirname, "../../discord/images/avatar_0.png");
        iconBuffer = await fs.readFile(fallbackIconPath);
      } catch (error) {
        console.error("[criarImagemPainel] Erro ao carregar imagem de fallback:", error);
      }
    }
    if (iconBuffer) {
      const circleMask = Buffer.from(
        `<svg><circle cx="${ICON_DIAMETER / 2}" cy="${ICON_DIAMETER / 2}" r="${ICON_DIAMETER / 2}" /></svg>`
      );
      circularIconBuffer = await sharp(iconBuffer).resize(ICON_DIAMETER, ICON_DIAMETER).composite([{ input: circleMask, blend: "dest-in" }]).png().toBuffer();
    }
    const finalImageBuffer = await sharp(gradientSvg).composite([
      { input: imagePath },
      ...circularIconBuffer ? [{ input: circularIconBuffer, top: Math.round(ICON_Y), left: Math.round(ICON_X) }] : []
    ]).png().toBuffer();
    return new AttachmentBuilder(finalImageBuffer, { name: "painel-servidor.png" });
  } catch (error) {
    console.error("Erro ao gerar imagem com Sharp:", error);
    return null;
  }
}
export {
  criarImagemPainel
};
