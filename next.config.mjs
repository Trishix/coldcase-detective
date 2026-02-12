/** @type {import('next').NextConfig} */
const nextConfig = {
    // Necessary for lancedb/fs interactions in serverless if needed
    serverExternalPackages: ['lancedb', '@lancedb/lancedb', '@xenova/transformers'],
    outputFileTracingExcludes: {
        '*': [
            './node_modules/@lancedb/lancedb-linux-x64-musl/**/*', // Alpine Linux
            './node_modules/@lancedb/lancedb-darwin-x64/**/*', // Intel Mac
            './node_modules/@lancedb/lancedb-darwin-arm64/**/*', // Apple Silicon
            './node_modules/@lancedb/lancedb-win32-x64/**/*', // Windows
        ],
    },
    webpack: (config) => {
        config.externals.push('onnxruntime-node', 'sharp');
        return config;
    },
};

export default nextConfig;
