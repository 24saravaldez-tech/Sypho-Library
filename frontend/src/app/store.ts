import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { librosApi } from '../api/libros.ts'

export const store = configureStore({
  reducer: {
    // Aquí se guarda la caché y el estado de las peticiones de esta API.
    [librosApi.reducerPath]: librosApi.reducer,
  },
  // El middleware coordina peticiones, suscripciones e invalidación de caché.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(librosApi.middleware),
  devTools: import.meta.env.DEV,
})

// Habilita los eventos usados por refetchOnFocus/refetchOnReconnect.
setupListeners(store.dispatch)

// Tipos inferidos del store; útiles al agregar otros estados de Redux.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
