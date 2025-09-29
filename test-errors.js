// Script para testar erros no Paint Ball VR
const puppeteer = require('puppeteer');

async function testErrors() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Capturar erros do console
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
            console.log('❌ Erro:', msg.text());
        }
    });
    
    page.on('pageerror', error => {
        errors.push(error.message);
        console.log('❌ Page Error:', error.message);
    });
    
    try {
        console.log('🔍 Testando http://localhost:3000...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Aguardar carregamento completo
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log(`\n📊 Resultado: ${errors.length} erros encontrados`);
        if (errors.length === 0) {
            console.log('✅ Nenhum erro encontrado! Aplicação funcionando corretamente.');
        } else {
            console.log('❌ Erros encontrados:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
    } catch (error) {
        console.log('❌ Erro ao testar:', error.message);
    } finally {
        await browser.close();
    }
}

testErrors();