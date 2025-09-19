// db.ts

// Define a estrutura do objeto que será salvo no IndexedDB
export interface ImageData {
    id: string; // URL da imagem, usada como chave primária
    image: Blob;
    productId: string;
    timestamp: number;
}

const DB_NAME = 'bazapStoreDB';
const DB_VERSION = 2; // Incrementar a versão se for adicionar um novo índice
const OBJECT_STORE_NAME = 'images';

/**
 * Abre ou cria o banco de dados IndexedDB.
 * @returns O objeto do banco de dados.
 */
export function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
                const store = db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
                // Cria um índice para o productId para buscas mais rápidas
                store.createIndex('productIdIndex', 'productId', { unique: false });
            }
        };

        request.onsuccess = (event: Event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event: Event) => {
            reject('IndexedDB error: ' + (event.target as IDBOpenDBRequest).error);
        };
    });
}

/**
 * Salva um objeto de imagem (Blob + metadados) no IndexedDB.
 * @param id O ID único da imagem (URL).
 * @param imageBlob O objeto Blob da imagem.
 * @param productId O ID do produto associado.
 * @param mentionId O ID da menção associada.
 * @returns Mensagem de sucesso.
 */
export async function saveImageToDB(
    id: string,
    imageBlob: Blob,
    productId: string,
): Promise<string> {
    const db = await openDatabase();
    const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

    const imageData: ImageData = {
        id: id,
        image: imageBlob,
        productId: productId,
        timestamp: new Date().getTime(),
    };

    const request = objectStore.put(imageData);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            resolve('Image and metadata saved successfully!');
        };

        request.onerror = (event: Event) => {
            reject('Error saving data: ' + (event.target as IDBRequest).error);
        };
    });
}

/**
 * Verifica se uma imagem já existe no IndexedDB.
 * @param id O ID da imagem a ser verificada.
 * @returns Retorna true se a imagem existe, false caso contrário.
 */
export async function checkImageExists(id: string): Promise<boolean> {
    const db = await openDatabase();
    const transaction = db.transaction([OBJECT_STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

    const request = objectStore.get(id);

    return new Promise((resolve, reject) => {
        request.onsuccess = (event: Event) => {
            resolve((event.target as IDBRequest).result !== undefined);
        };

        request.onerror = (event: Event) => {
            reject('Error checking image existence: ' + (event.target as IDBRequest).error);
        };
    });
}

/**
 * Busca dados de uma imagem no IndexedDB com base no productId.
 * @param productId O ID do produto a ser buscado.
 * @returns Retorna o objeto de dados da imagem ou null se não for encontrado.
 */
export async function getImageByProductId(productId: string): Promise<ImageData | null> {
    const db = await openDatabase();
    const transaction = db.transaction([OBJECT_STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const productIdIndex = objectStore.index('productIdIndex');

    const request = productIdIndex.get(productId);

    return new Promise((resolve, reject) => {
        request.onsuccess = (event: Event) => {
            const result = (event.target as IDBRequest).result as ImageData | undefined;
            resolve(result || null);
        };

        request.onerror = (event: Event) => {
            reject('Error searching for image by productId: ' + (event.target as IDBRequest).error);
        };
    });
}

export async function clearDatabase(): Promise<string> {
    console.log('FUI LIMPO COM SUCESSO')
    const db = await openDatabase();
    const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

    const request = objectStore.clear();

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            resolve('Banco de dados limpo com sucesso!');
        };

        request.onerror = (event: Event) => {
            reject('Erro ao limpar o banco de dados: ' + (event.target as IDBRequest).error);
        };
    });
}