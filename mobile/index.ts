import { registerRootComponent } from 'expo';
import App from './App';

// Silence RNFB v21 namespaced-API deprecation warnings — migrating to modular
// API in a future release once RNFB v22 is stable on RN 0.81+
(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

registerRootComponent(App);
