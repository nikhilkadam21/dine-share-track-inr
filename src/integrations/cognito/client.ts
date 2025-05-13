
// Import the openid-client package correctly
import { Issuer } from 'openid-client';
import type { Client, TokenSet, UserinfoResponse } from 'openid-client';

// Cognito configuration
const COGNITO_ISSUER_URL = 'https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_Kkf2CIg52';
const COGNITO_CLIENT_ID = '46i8l0jtoo8oqr413qpfnfljim';
const COGNITO_CLIENT_SECRET = 'ga73tap5vm2r3ukidd091hjpqqp1s4e74475bs9vkuomuqhf2cu';
const COGNITO_REDIRECT_URI = 'https://d84l1y8p4kdic.cloudfront.net';
const COGNITO_LOGOUT_URL = `https://ap-south-1kkf2cig52.auth.ap-south-1.amazoncognito.com/logout?client_id=${COGNITO_CLIENT_ID}&logout_uri=${COGNITO_REDIRECT_URI}`;
const COGNITO_LOGIN_URL = `https://ap-south-1kkf2cig52.auth.ap-south-1.amazoncognito.com/login?client_id=${COGNITO_CLIENT_ID}&response_type=code&scope=email+openid+phone&redirect_uri=${encodeURIComponent(COGNITO_REDIRECT_URI)}`;

// TypeScript interface for our client
let cognitoClient: Client | null = null;

// Initialize the OpenID client
export const initializeCognitoClient = async (): Promise<Client> => {
  if (cognitoClient) {
    return cognitoClient;
  }

  try {
    const issuer = await Issuer.discover(COGNITO_ISSUER_URL);
    cognitoClient = new issuer.Client({
      client_id: COGNITO_CLIENT_ID,
      client_secret: COGNITO_CLIENT_SECRET,
      redirect_uris: [COGNITO_REDIRECT_URI],
      response_types: ['code'],
    });
    
    return cognitoClient;
  } catch (error) {
    console.error('Failed to initialize Cognito client:', error);
    throw error;
  }
};

// Generate authentication URL with state and nonce
export const generateAuthUrl = () => {
  // Import generators only when needed (this avoids the direct import issue)
  const { generators } = require('openid-client');
  const nonce = generators.nonce();
  const state = generators.state();
  
  // Store nonce and state in sessionStorage
  sessionStorage.setItem('cognito_nonce', nonce);
  sessionStorage.setItem('cognito_state', state);
  
  return COGNITO_LOGIN_URL;
};

// Handle authentication callback
export const handleAuthCallback = async (url: string): Promise<any> => {
  try {
    const client = await initializeCognitoClient();
    const params = client.callbackParams(url);
    const nonce = sessionStorage.getItem('cognito_nonce') || undefined;
    const state = sessionStorage.getItem('cognito_state') || undefined;
    
    const tokenSet = await client.callback(
      COGNITO_REDIRECT_URI,
      params,
      { nonce, state }
    );
    
    const userInfo = await client.userinfo(tokenSet.access_token!);
    
    // Clean up session storage
    sessionStorage.removeItem('cognito_nonce');
    sessionStorage.removeItem('cognito_state');
    
    return { tokenSet, userInfo };
  } catch (error) {
    console.error('Auth callback error:', error);
    throw error;
  }
};

// Handle logout
export const handleLogout = () => {
  // Clear any local auth data
  localStorage.removeItem('user');
  sessionStorage.removeItem('cognito_nonce');
  sessionStorage.removeItem('cognito_state');
  
  // Redirect to Cognito logout
  window.location.href = COGNITO_LOGOUT_URL;
};

export const COGNITO = {
  LOGIN_URL: COGNITO_LOGIN_URL,
  LOGOUT_URL: COGNITO_LOGOUT_URL,
  REDIRECT_URI: COGNITO_REDIRECT_URI
};
