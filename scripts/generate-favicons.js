const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_IMAGE = path.join(__dirname, 'logo.png');
const OUTPUT_DIR = path.join(__dirname, '../app');

// Percentual de border radius (20% = bordas bem arredondadas)
const BORDER_RADIUS_PERCENT = 20;

const sizes = {
  favicon: [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
  ],
  icons: [
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
  ],
  apple: [
    { size: 180, name: 'apple-touch-icon.png' },
  ],
};

/**
 * Cria uma máscara SVG com bordas arredondadas
 * @param {number} size - Tamanho da imagem em pixels
 * @returns {Buffer} Buffer do SVG
 */
function createRoundedMask(size) {
  const radius = Math.round((size * BORDER_RADIUS_PERCENT) / 100);
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/>
    </svg>
  `;
  
  return Buffer.from(svg);
}

/**
 * Gera um favicon com bordas arredondadas
 * @param {number} size - Tamanho da imagem
 * @param {string} outputPath - Caminho de saída
 */
async function generateRoundedIcon(size, outputPath) {
  // 1. Redimensionar a imagem original
  const resizedImage = await sharp(SOURCE_IMAGE)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  // 2. Criar máscara com bordas arredondadas
  const mask = createRoundedMask(size);

  // 3. Aplicar a máscara sobre a imagem
  await sharp(resizedImage)
    .composite([{
      input: mask,
      blend: 'dest-in'
    }])
    .png()
    .toFile(outputPath);
}

async function generateFavicons() {
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`❌ Arquivo fonte não encontrado: ${SOURCE_IMAGE}`);
    console.log('📝 Coloque uma imagem PNG quadrada (recomendado 1024x1024) com o nome "logo.png" na pasta scripts/');
    console.log('💡 Dica: Use uma imagem com fundo transparente para melhor resultado');
    return;
  }

  console.log('🎨 Gerando favicons com bordas arredondadas...');
  console.log(`📐 Border radius: ${BORDER_RADIUS_PERCENT}%\n`);

  try {
    // Verificar se a pasta de saída existe
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Gerar PNGs para favicon em diferentes tamanhos
    for (const { size, name } of sizes.favicon) {
      await generateRoundedIcon(size, path.join(OUTPUT_DIR, name));
      console.log(`✅ ${name} (${size}x${size}) - com bordas arredondadas`);
    }

    // Gerar ícones para PWA
    for (const { size, name } of sizes.icons) {
      await generateRoundedIcon(size, path.join(OUTPUT_DIR, name));
      console.log(`✅ ${name} (${size}x${size}) - com bordas arredondadas`);
    }

    // Gerar Apple Touch Icon
    for (const { size, name } of sizes.apple) {
      await generateRoundedIcon(size, path.join(OUTPUT_DIR, name));
      console.log(`✅ ${name} (${size}x${size}) - com bordas arredondadas`);
    }

    // Gerar favicon.ico (usando a imagem 32x32)
    await generateRoundedIcon(32, path.join(OUTPUT_DIR, 'favicon.ico'));
    console.log(`✅ favicon.ico (32x32) - com bordas arredondadas`);

    // Copiar ícone principal para app/icon.png (Next.js detecta automaticamente)
    await generateRoundedIcon(512, path.join(OUTPUT_DIR, 'icon.png'));
    console.log(`✅ icon.png (512x512) - Ícone principal com bordas arredondadas`);

    console.log('\n✨ Todos os favicons foram gerados com sucesso!');
    console.log(`📁 Arquivos salvos em: ${OUTPUT_DIR}`);
    console.log(`🎨 Border radius aplicado: ${BORDER_RADIUS_PERCENT}%`);
    console.log('\n📌 Próximos passos:');
    console.log('   1. Verifique os arquivos gerados na pasta app/');
    console.log('   2. O Next.js detectará automaticamente os ícones');
    console.log('   3. Execute "npm run dev" e acesse http://localhost:3000');
    console.log('   4. Verifique o favicon no navegador');
    console.log('\n💡 Dica: Ajuste BORDER_RADIUS_PERCENT no script se quiser mais ou menos arredondamento');
  } catch (error) {
    console.error('❌ Erro ao gerar favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
