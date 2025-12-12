/**
 * Background service worker for DAO Governance Co-Pilot
 * Handles X402 micropayment events and fetch requests (bypasses ad blockers)
 */

console.log("[DAO Co-Pilot] Background service worker started");

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[DAO Co-Pilot] Received message:", request.type);

  if (request.type === "BACKGROUND_FETCH") {
    // Handle fetch requests from content script (bypasses ad blockers)
    handleBackgroundFetch(request.data)
      .then(sendResponse)
      .catch((error) => {
        console.error("[DAO Co-Pilot] Background fetch error:", error);
        sendResponse({ 
          error: error.message,
          status: 500
        });
      });
    
    return true; // Keep message channel open for async response
  }

  if (request.type === "ANALYZE_PROPOSAL") {
    // Handle proposal analysis request
    handleProposalAnalysis(request.data)
      .then(sendResponse)
      .catch((error) => {
        console.error("[DAO Co-Pilot] Analysis error:", error);
        sendResponse({ error: error.message });
      });
    
    return true;
  }

  if (request.type === "PAYMENT_REQUIRED") {
    // Handle X402 micropayment
    handleMicropayment(request.data)
      .then(sendResponse)
      .catch((error) => {
        console.error("[DAO Co-Pilot] Payment error:", error);
        sendResponse({ error: error.message });
      });
    
    return true;
  }
});

async function handleBackgroundFetch(data: {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}) {
  try {
    console.log(`[DAO Co-Pilot] Background fetching: ${data.method} ${data.url}`);
    
    const response = await fetch(data.url, {
      method: data.method,
      headers: data.headers,
      body: data.body,
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    console.log(`[DAO Co-Pilot] Background fetch complete: ${response.status}`);

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: responseData,
    };
  } catch (error: any) {
    console.error('[DAO Co-Pilot] Background fetch failed:', error);
    throw new Error(`Fetch failed: ${error.message}`);
  }
}

async function handleProposalAnalysis(data: any) {
  // This will integrate with X402 micropayment later
  console.log("[DAO Co-Pilot] Analyzing proposal:", data);
  
  // For now, just pass through to the API
  return { success: true };
}

async function handleMicropayment(data: any) {
  // TODO: Integrate with X402 micropayment contract
  console.log("[DAO Co-Pilot] Processing micropayment:", data);
  
  return { success: true, txHash: "0x..." };
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log("[DAO Co-Pilot] Extension installed:", details.reason);
  
  if (details.reason === "install") {
    // Show welcome page or setup instructions
    console.log("[DAO Co-Pilot] Welcome to DAO Governance Co-Pilot!");
  }
});
