export function defineBuyersPerProduct(mensagens) { // Definir os compradores para cada produto
    const palavrasChaveInteresse = ["quero", "fila", "qr", "qro"];
    const palavrasChaveDesistencia = ["desisto", "desisti", "cancelar", "cancela"];

    const agrupados = {};

    mensagens.forEach(msg => {
        const { productId, product, contact, number, name, interest, productImage, time, price } = msg;

        if (!agrupados[productId]) {
            agrupados[productId] = {
                productId,
                product,
                price,
                productImage,
                mensagens: []
            };
        }

        agrupados[productId].mensagens.push({
            contact: contact || number || name,
            interest,
            time
        });
    });

    // ordenar por hora
    for (const produto of Object.values(agrupados)) {
        produto.mensagens.sort((a, b) => {
            const [h1, m1] = a.time.split(":").map(Number);
            const [h2, m2] = b.time.split(":").map(Number);
            return h1 !== h2 ? h1 - h2 : m1 - m2;
        });

        // definir quem levou
        const interessados = {};
        for (const msg of produto.mensagens) {
            if (!interessados[msg.contact]) interessados[msg.contact] = [];
            interessados[msg.contact].push(msg.interest);
        }

        produto.levou = null;
        for (const [contact, interacoes] of Object.entries(interessados)) {
            const temQueroOuFila = palavrasChaveInteresse.some(palavra =>
                interacoes.some(frase => frase.toLowerCase().includes(palavra))
            );

            const temDesisto = palavrasChaveDesistencia.some(palavra =>
                interacoes.some(frase => frase.toLowerCase().includes(palavra))
            );

            if (temQueroOuFila && !temDesisto) {
                produto.levou = contact;
                break;
            }
        }
    }

    return Object.values(agrupados);
}