export const successResponse = (data: any, message: string = "Operación exitosa") => {
    return { success: true, message, data };
};

export const errorResponse = (error: unknown, errors = null) => {
    if (error instanceof Error) {
        const message = error.message || "Ocurrió un error en el servidor";
        return { success: false, message, errors };
    }

    if (typeof error === 'string') {
        const message = error || "Ocurrió un error en el servidor";
        return { success: false, message, errors };
    }

}