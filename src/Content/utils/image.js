export function extractPublishedProductImage(images) {
    const blobImage = Array.from(images).find(img => img.src.startsWith('blob:'));

    if (blobImage) {
        return blobImage.src
    } else {
        const base64Image = Array.from(images).find(img => img.src.startsWith('data:image/'));

        if (base64Image) {
            return base64Image.src
        } else {
            return null
        }
    }
}

export function extractMentionedProductImage(element) {
    const divs = element.querySelectorAll('div[style*="background-image"]');

    let imageUrl = null;

    if (divs[1] && divs[1].style.backgroundImage) {
        // Pega a URL do segundo div com background-image
        imageUrl = divs[1].style.backgroundImage;
    } else if (divs[0] && divs[0].style.backgroundImage) {
        // Fallback para o primeiro
        imageUrl = divs[0].style.backgroundImage;
    }

    // Remove 'url("...")' da string e deixa só a URL limpa
    if (imageUrl) {
        imageUrl = imageUrl.slice(5, -2); // remove url(" e ")
    }

    return imageUrl;
}