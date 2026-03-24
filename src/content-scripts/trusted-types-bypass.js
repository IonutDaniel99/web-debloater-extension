/**
 * Trusted Types Policy Bypass
 * 
 * Creates a permissive default Trusted Types policy to allow dynamic script injection.
 * This must run at document_start (before any other scripts) to be effective.
 */

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  try {
    window.trustedTypes.createPolicy('default', {
      createHTML: string => string,
      createScriptURL: string => string,
      createScript: string => string,
    });
    console.log('[Debloater] Trusted Types default policy created');
  } catch (error) {
    // Policy might already exist, which is fine
    console.log('[Debloater] Trusted Types policy already exists or failed:', error.message);
  }
}
