import { saveImageToDB, checkImageExists } from '../../database/db.ts'

/**
 * Busca uma imagem de uma URL e a converte para um Blob.
 * @param {string} url - A URL da imagem.
 * @returns {Promise<Blob | null>} O Blob da imagem ou null em caso de falha.
 */
async function fetchImageAsBlob(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('Failed to fetch image:', error);
        return null;
    }
}

/**
 * Processa e salva uma única imagem no IndexedDB,
 * evitando salvamento duplicado.
 * @param {string} url - A URL da imagem a ser processada.
 * @param {string} productId - O ID do produto.
 * @param {string} mentionId - O ID da menção.
 */
export async function processAndSaveSingleImage(url, productId, mentionId) {
    const imageId = url; // A URL ainda é um bom ID para a chave primária

    // console.log(`Checking if image from URL: ${url} already exists.`);
    const exists = await checkImageExists(imageId);

    if (exists) {
        // console.log(`Image from ${url} already exists. Skipping.`);
        return;
    }

    // console.log(`Image from ${url} not found. Starting download.`);
    const imageBlob = await fetchImageAsBlob(url);
    if (imageBlob) {
        // Passando os novos dados para a função de salvamento
        await saveImageToDB(imageId, imageBlob, productId, mentionId);
        // console.log(`Image and metadata saved with ID: ${imageId}`);
    }
}

/**
 * Processa e salva uma lista de objetos de imagem no IndexedDB,
 * evitando duplicatas.
 * @param {Array<{url: string, productId: string, mentionId: string}>} imagesToProcess - Lista de objetos com as URLs e metadados.
 */
export async function processAndSaveImages(imagesToProcess) {
    // Cria um Set para garantir que cada URL seja única
    const uniqueUrls = new Set(imagesToProcess.map(img => img.url));

    const promises = [...uniqueUrls].map(async (url) => {
        // Encontre o objeto original para obter os metadados
        const imageData = imagesToProcess.find(img => img.url === url);
        if (imageData) {
            // Chama a função para processar uma única imagem com os metadados
            await processAndSaveSingleImage(imageData.url, imageData.productId, imageData.mentionId);
        }
    });

    await Promise.all(promises);
    // console.log('All images processed.');
}