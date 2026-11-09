export const validarTexto = (valor: unknown): string | undefined => {
    if (typeof valor !== "string" || valor.trim() === "") {
        return undefined
    }
    return valor.trim()
}

export const validarNumero = (valor: unknown): number | undefined => {
    if (typeof valor !== "string" || valor.trim() === "") {
        return undefined
    }
    const numero = Number(valor)
    return Number.isInteger(numero) ? numero : undefined
}
