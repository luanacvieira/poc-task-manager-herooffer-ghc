// ❌ SECURITY VULNERABILITIES FOR CODEQL DETECTION ❌
// Este arquivo contém vulnerabilidades propositais para demonstração de segurança

/**
 * ⚠️ XSS Vulnerabilities - Cross-Site Scripting
 */
function demonstrateXSS() {
    // 🚨 Vulnerability 1: Direct DOM manipulation with user input
    const userInput = new URLSearchParams(window.location.search).get('input');
    document.body.innerHTML = userInput; // CodeQL should detect this
    
    // 🚨 Vulnerability 2: document.write with untrusted data
    const maliciousScript = `<script>alert('XSS: ${userInput}')</script>`;
    document.write(maliciousScript); // CodeQL should detect this
    
    // 🚨 Vulnerability 3: innerHTML with template literals
    const container = document.getElementById('content');
    container.innerHTML = `<div>User said: ${userInput}</div>`; // CodeQL should detect this
}

/**
 * ⚠️ Code Injection Vulnerabilities
 */
function demonstrateCodeInjection() {
    const userCode = new URLSearchParams(window.location.search).get('code');
    
    // 🚨 Vulnerability 4: eval() with user input
    eval(`console.log("${userCode}")`); // CodeQL should detect this
    
    // 🚨 Vulnerability 5: Function constructor with user input
    const dynamicFunction = new Function('return ' + userCode);
    dynamicFunction(); // CodeQL should detect this
    
    // 🚨 Vulnerability 6: setTimeout with string code
    setTimeout(`console.log("${userCode}")`, 1000); // CodeQL should detect this
}

/**
 * ⚠️ Prototype Pollution
 */
function demonstratePrototypePollution() {
    const userObj = JSON.parse(new URLSearchParams(window.location.search).get('obj') || '{}');
    
    // 🚨 Vulnerability 7: Unsafe merge without validation
    function unsafeMerge(target, source) {
        for (let key in source) {
            target[key] = source[key]; // CodeQL should detect this
        }
    }
    
    unsafeMerge({}, userObj);
}

/**
 * ⚠️ Path Traversal (if applicable to frontend)
 */
function demonstratePathTraversal() {
    const filename = new URLSearchParams(window.location.search).get('file');
    
    // 🚨 Vulnerability 8: Unsafe path construction
    const filepath = `./uploads/${filename}`; // CodeQL should detect this pattern
    fetch(filepath); // Potential path traversal
}

// Export functions for CodeQL analysis
module.exports = {
    demonstrateXSS,
    demonstrateCodeInjection,
    demonstratePrototypePollution,
    demonstratePathTraversal
};