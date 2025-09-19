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

    function getImagesBg(el, type) {
        if (!el) return null;

        let image = null;
        const divs = el.querySelectorAll('div[style*="background-image"]');

        if (divs[1] && divs[1].style.backgroundImage) {
            image = divs[1].style.backgroundImage;
        } else if (divs[0] && divs[0].style.backgroundImage) {
            image = divs[0].style.backgroundImage;
        }

        return image
    }

    let imageUrl = getImagesBg(element, 'def') || getImagesBg(element?.querySelector('._agtn'), 'gnt')

    if (imageUrl) {
        imageUrl = imageUrl.slice(5, -2);
    }

    return imageUrl;
}