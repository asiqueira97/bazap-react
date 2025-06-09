/*
Dada uma data, eu quero saber se ela está dentro de 7 dias. 
Exemplo: Hoje é dia 27/05/2025, seu passar a data 21/05/2025, precisa me devolver "quarta-feira".
Pois do dia 21 ate o dia 27 tem 7 dias, entao quero o nome do dia da semana. Se passar de 7 dias, quero apenas a data mesmo.
*/

export function getWeekdayIfWithin7Days(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day);

    const today = new Date();

    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today - inputDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays >= 0 && diffDays <= 6) {
        const weekDay = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(inputDate);
        return `${dateStr}|${weekDay.toUpperCase()}`
    }

    return dateStr;
}

// old
export function getTime(str) {
    const regex = /\[(\d{2}:\d{2}), (\d{2}\/\d{2}\/\d{4})\]/;
    const match = str.match(regex);
    if (match) {
        return {
            time: match[1],
            date: match[2],
        };
    } else {
        return null;
    }
}

export function filtrarPorHorario(lista, horaInicio, horaFim) {
    function horaParaMinutos(hora) {
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    }

    const inicioMin = horaParaMinutos(horaInicio);
    const fimMin = horaParaMinutos(horaFim);

    return lista.filter((item) => {
        const horaItemMin = horaParaMinutos(item.time);
        return horaItemMin >= inicioMin && horaItemMin <= fimMin;
    });
}

export function filtrarPorData(lista, dataInicio, dataFim = null) {
    const parseDate = (str) => {
        const [dia, mes, ano] = str.split('/').map(Number);
        return new Date(ano, mes - 1, dia);
    };

    const inicio = parseDate(dataInicio);
    const fim = dataFim ? parseDate(dataFim) : inicio;

    if (fim < inicio) {
        return { error: 'Data final não pode ser menor que a data inicial.' };
    }

    return lista.filter((item, index) => {
        if (!item?.day) {
            item.day = lista[index - 1].day
            item.time = lista[index - 1].time
        }
        const dataItem = parseDate(item?.day);
        return dataItem >= inicio && dataItem <= fim;
    });
}

export function getDateDaysAgo(daysAgo) {
    const diasDaSemana = [
        'domingo',
        'segunda-feira',
        'terça-feira',
        'quarta-feira',
        'quinta-feira',
        'sexta-feira',
        'sábado',
    ];

    const today = new Date();
    today.setDate(today.getDate() - daysAgo);

    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const diaSemana = diasDaSemana[today.getDay()];

    return `${dd}/${mm}/${yyyy}|${diaSemana}`;
}

export function formatDateWithRelativeDay(dateStr) {
    const diasDaSemana = [
        'domingo',
        'segunda-feira',
        'terça-feira',
        'quarta-feira',
        'quinta-feira',
        'sexta-feira',
        'sábado',
    ];

    const [dd, mm, yyyy] = dateStr.split('/').map(Number);
    const inputDate = new Date(yyyy, mm - 1, dd);

    // Normaliza datas para ignorar horário
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    ontem.setHours(0, 0, 0, 0);

    inputDate.setHours(0, 0, 0, 0); // também zera horas da data de entrada

    let sufixo;

    if (inputDate.getTime() === hoje.getTime()) {
        sufixo = 'hoje';
    } else if (inputDate.getTime() === ontem.getTime()) {
        sufixo = 'ontem';
    } else {
        sufixo = diasDaSemana[inputDate.getDay()];
    }

    return `${dateStr}|${sufixo.toUpperCase()}`;
}

export function subtractOneDay(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    date.setDate(date.getDate() - 1);

    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();

    return `${d}/${m}/${y}`;
}
