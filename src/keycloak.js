import Keycloak from "keycloak-js";
import { reactive } from "vue";

let keycloak = null;

export const state = reactive({
  authenticated: false,
  userProfile: null
});

export function initKeycloak() {
  return new Promise((resolve, reject) => {
    keycloak = new Keycloak({
      url: "https://3.64.180.31.sslip.io/auth",
      realm: "codesnap",
      clientId: "codesnap-client"
    });

    // Restore tokens from localStorage if available
    const storedToken = localStorage.getItem('kc_token');
    const storedRefreshToken = localStorage.getItem('kc_refreshToken');

    keycloak.init({
      onLoad: "check-sso",
      checkLoginIframe: false,
      pkceMethod: 'S256',
      token: storedToken || undefined,
      refreshToken: storedRefreshToken || undefined,
    }).then(authenticated => {
      state.authenticated = !!authenticated;

      if (authenticated) {
        // Store tokens in localStorage for persistence across refreshes
        localStorage.setItem('kc_token', keycloak.token);
        localStorage.setItem('kc_refreshToken', keycloak.refreshToken);

        keycloak.loadUserProfile().then(profile => {
          state.userProfile = profile;
        }).catch(err => {
          console.error("Failed to load user profile:", err);
        });

        startTokenRefresh();
      } else {
        // Clear stored tokens if not authenticated
        localStorage.removeItem('kc_token');
        localStorage.removeItem('kc_refreshToken');
      }

      resolve(keycloak);
    }).catch(err => {
      console.error("Keycloak init error:", err);
      // Clear tokens on error
      localStorage.removeItem('kc_token');
      localStorage.removeItem('kc_refreshToken');
      reject(err);
    });
  });
}

export function getKeycloak() {
  return keycloak;
}

export function getToken() {
  return keycloak?.token;
}

export function login() {
  keycloak?.login();
}

export function register() {
  if (!keycloak) {
    console.error("Keycloak not initialized");
    return;
  }
  keycloak.register();
}

export function logout() {
  if (!keycloak) {
    console.error("Keycloak not initialized");
    return;
  }

  // Clear stored tokens
  localStorage.removeItem('kc_token');
  localStorage.removeItem('kc_refreshToken');
  state.authenticated = false;
  state.userProfile = null;

  keycloak.logout({
    redirectUri: window.location.origin
  }).catch(err => {
    console.error("Logout failed:", err);
  });
}

function startTokenRefresh() {
  setInterval(() => {
    keycloak.updateToken(60)
      .then(refreshed => {
        if (refreshed) {
          console.log("Keycloak token refreshed");
          // Update stored tokens
          localStorage.setItem('kc_token', keycloak.token);
          localStorage.setItem('kc_refreshToken', keycloak.refreshToken);
        }
      })
      .catch(() => {
        console.warn("Failed to refresh token, logging out");
        logout();
      });
  }, 60000);
}
