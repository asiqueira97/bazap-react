import React, { useState, useEffect } from 'react';
import Logo from '../../../assets/logo.png'
import { getImageByProductId, ImageData } from '../../../database/db';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error("Erro na conversão para Base64."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

interface ProductImageProps {
    productId: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ productId }) => {
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAndConvertImage = async () => {
            try {
                const imageData: ImageData | null = await getImageByProductId(productId);

                if (imageData && imageData.image instanceof Blob) {
                    const base64Url = await blobToBase64(imageData.image);
                    setImageDataUrl(base64Url);
                    console.log(`Imagem para o produto ${productId} convertida para Base64.`);
                } else {
                    setImageDataUrl(null);
                    console.log(`Nenhuma imagem encontrada para o produto ${productId}.`);
                }
            } catch (error) {
                console.error("Erro ao buscar ou converter imagem:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAndConvertImage();
    }, [productId]);

    if (loading) {
        return <div>Carregando imagem...</div>;
    }

    if (imageDataUrl) {
        return <img src={imageDataUrl} alt={`Imagem do produto ${productId}`} style={{ width: "85px", height: "85px", borderRadius: "8px", objectFit: "cover" }} />;
    }

    return <img src={Logo} />
};

export default ProductImage;