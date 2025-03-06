// src/index.js
// Export the AdaptiveAssetLoader component as the default export
// This allows developers to import it directly from the package
// Why: Default exports simplify usage (e.g., import AdaptiveAssetLoader from 'react-adaptive-asset-loader')
// and align with React community conventions for libraries
import AdaptiveAssetLoader from './AdaptiveAssetLoader.jsx';

export default AdaptiveAssetLoader;

// Export named exports for flexibility (optional but best practice)
// Why: Named exports allow developers to import specific parts if needed, enhancing modularity
export { AdaptiveAssetLoader };