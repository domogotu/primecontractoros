import { chromium } from 'playwright';

const viewports = [
  { name: '390px (iPhone SE)', width: 390, height: 844 },
  { name: '430px (Pixel 6)', width: 430, height: 932 },
  { name: '768px (iPad)', width: 768, height: 1024 },
  { name: '1920px (Desktop)', width: 1920, height: 1080 },
];

const testUrl = 'https://3000-i9ne402diuxo6wnn137ns-fd19a0a7.us2.manus.computer/app/dashboard';

async function testResponsiveness() {
  const browser = await chromium.launch();
  
  for (const viewport of viewports) {
    const context = await browser.createContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    
    try {
      console.log(`\n✓ Testing ${viewport.name}...`);
      await page.goto(testUrl, { waitUntil: 'networkidle' });
      
      // Check if GuidancePanel is visible
      const guidancePanel = await page.locator('text=What Do I Do Next?').isVisible();
      console.log(`  - GuidancePanel visible: ${guidancePanel ? '✓' : '✗'}`);
      
      // Check if summary cards are visible
      const summaryCards = await page.locator('text=OPPORTUNITIES').isVisible();
      console.log(`  - Summary cards visible: ${summaryCards ? '✓' : '✗'}`);
      
      // Check if Quick Access is visible
      const quickAccess = await page.locator('text=Quick Access').isVisible();
      console.log(`  - Quick Access visible: ${quickAccess ? '✓' : '✗'}`);
      
      // Check for layout issues (no horizontal scroll needed)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth = viewport.width;
      const hasHorizontalScroll = bodyWidth > windowWidth;
      console.log(`  - No horizontal scroll: ${!hasHorizontalScroll ? '✓' : '✗'} (body: ${bodyWidth}px, viewport: ${windowWidth}px)`);
      
    } catch (error) {
      console.error(`  Error testing ${viewport.name}:`, error.message);
    } finally {
      await context.close();
    }
  }
  
  await browser.close();
  console.log('\n✓ Mobile responsiveness testing complete');
}

testResponsiveness().catch(console.error);
