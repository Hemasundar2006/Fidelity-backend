const fetch = globalThis.fetch;

async function check() {
  const res = await fetch('http://localhost:5173/');
  console.log('HTTP Status:', res.status);
  const html = await res.text();
  console.log('HTML Length:', html.length);
  console.log('Has root div:', html.includes('id="root"'));

  // Also fetch the compiled LandingPage module from Vite
  const jsRes = await fetch('http://localhost:5173/src/pages/LandingPage.jsx');
  console.log('LandingPage.jsx compiled by Vite status:', jsRes.status);
  const jsCode = await jsRes.text();
  console.log('LandingPage compiled code length:', jsCode.length);
  if (jsCode.includes('error') || jsCode.includes('Error')) {
    const lines = jsCode.split('\n').filter(l => l.toLowerCase().includes('error'));
    console.log('Errors found in compiled module:', lines.slice(0, 5));
  } else {
    console.log('No compile errors found in Vite module!');
  }
}

check().catch(console.error);
