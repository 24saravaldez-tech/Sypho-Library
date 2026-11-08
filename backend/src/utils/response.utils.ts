export const successResponse = (data: any, message: string = "Operación exitosa") => {
    return {
        success: true,
        message: message || "Operacion exitosa",
        data
    }
};

export const errorResponse = (error: unknown, errors = null) => {
    const mensaje = error instanceof Error ? error.message : typeof error === "string" ? error : ""
    return {
        success: false,
        message: mensaje || "Ocurrió un error en el servidor",
        errors,
    }

}