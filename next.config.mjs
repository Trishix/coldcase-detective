/** @type {import('next').NextConfig} */
const nextConfig = {
    // Necessary for lancedb/fs interactions in serverless if needed
    serverExternalPackages: ['lancedb', '@lancedb/lancedb', '@xenova/transformers'],
    webpack: (config) => {
        config.externals.push('onnxruntime-node', 'sharp');
        return config;
    },
};

export default nextConfig;
