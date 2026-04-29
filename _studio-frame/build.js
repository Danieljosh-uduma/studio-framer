import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

async function processTailwind() {
    const cssPath = 'src/styles/tailwind.css';
    
    if (!fs.existsSync(cssPath)) {
        console.warn('⚠️  tailwind.css not found, skipping Tailwind processing');
        return '';
    }

    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    try {
        const result = await postcss([
            postcssImport(),
            tailwindcss(),
            autoprefixer(),
        ]).process(cssContent, {
            from: cssPath,
            to: 'src/styles/tailwind.compiled.css',
        });
        
        return result.css;
    } catch (error) {
        console.error('❌ Tailwind processing failed:', error);
        throw error;
    }
}

async function build() {
    const outDir = '_studio';
    
    // Ensure output directory exists
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
    }

    console.log('🚀 Starting Studio Framer build...');

    try {
        // 0. Process Tailwind CSS
        console.log('🎨 Processing Tailwind CSS...');
        let tailwindCss = '';
        try {
            tailwindCss = await processTailwind();
            console.log('✅ Tailwind CSS processed');
        } catch (error) {
            console.warn('⚠️  Tailwind processing skipped');
        }

        // 1. Bundle and minify JS
        console.log('📦 Bundling JavaScript...');
        await esbuild.build({
            entryPoints: ['index.js'],
            bundle: true,
            minify: true,
            outfile: path.join(outDir, 'index.js'),
            format: 'esm',
            target: ['es2020'],
        });

        // 2. Process HTML and extract CSS
        console.log('📄 Processing HTML...');
        const htmlSource = fs.readFileSync('index.html', 'utf8');
        
        // Extract style content from HTML
        const styleMatch = htmlSource.match(/<style>([\s\S]*?)<\/style>/);
        let htmlCss = '';
        if (styleMatch) {
            htmlCss = styleMatch[1].trim();
        }

        // Combine Tailwind CSS with inline CSS
        const combinedCss = htmlCss ? (tailwindCss ? tailwindCss + '\n' + htmlCss : htmlCss) : tailwindCss;

        // Write CSS file
        if (combinedCss) {
            fs.writeFileSync(path.join(outDir, 'index.css'), combinedCss);
        }

        // Update HTML: remove internal style, add link tag
        let updatedHtml = htmlSource.replace(/<style>[\s\S]*?<\/style>/, '');
        
        // Add CSS link if we have styles
        if (combinedCss) {
            updatedHtml = updatedHtml.replace(
                '</head>',
                '    <link rel="stylesheet" href="index.css">\n</head>'
            );
        }
        
        // Write updated HTML
        fs.writeFileSync(path.join(outDir, 'index.html'), updatedHtml);

        console.log('✅ Build complete! Output directory: /_studio');
        console.log('   - index.js (bundled & minified)');
        if (combinedCss) {
            console.log('   - index.css (Tailwind + extracted styles)');
        }
        console.log('   - index.html (production ready)');
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

build();
