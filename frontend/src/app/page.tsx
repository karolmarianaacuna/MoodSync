// Necesario porque usamos useState y useRouter
// que son herramientas del navegador, no del servidor
'use client'

// useState para controlar si mostramos el splash o no
import { useState } from 'react'

// useRouter para navegar entre páginas sin recargar
import { useRouter } from 'next/navigation'

// Trae el componente que acabamos de crear
import SplashScreen from '../components/SplashScreen'

export default function Home() {

  // showSplash controla si el splash está visible
  // empieza en true porque lo primero que ve el usuario es el splash
  const [showSplash, setShowSplash] = useState(true)

  // router nos permite cambiar de página desde el código
  const router = useRouter()

  // Esta función se llama cuando SplashScreen termina
  const handleSplashFinish = () => {
    // Oculta el splash
    setShowSplash(false)
    // Lleva al usuario a la pantalla de login
    router.push('/login')
  }

  // Si showSplash es true → muestra el splash
  // Le pasa handleSplashFinish como onFinish
  // Cuando el splash termine, él mismo llama a esa función
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />
  }

  // Si showSplash es false → no muestra nada
  // porque ya redirigió al login
  return null
}
